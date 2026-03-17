import type { Request, Response } from "express";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cloudinary } from "../config/cloudinary.js";
import { prisma } from "../config/prisma.js";
import { razorpay, razorpayKeyId, razorpayKeySecret } from "../config/razorpay.js";
import type { AuthenticatedRequest } from "../middlewares/authMiddleware.js";
import {
  ORDER_STATUS_FLOW,
  SHOP_UPI_ID,
  TECHNICIAN_PHONE,
  clamp,
  cloudinaryOptimizeUrl,
  createUuid,
  decodeCompatMetaFromDescription,
  demoProducts,
  encodeCompatMetaInDescription,
  ensurePhase1ProductSchema,
  ensurePhase2Schema,
  makeSimplePdfBuffer,
  median,
  parseFlexibleDate,
  parseOptionalNumber,
  tokenize,
} from "../config/runtime.js";
import type { ProductCompatMeta } from "../config/runtime.js";

export const getProducts = async (_req: Request, res: Response) => {
  try {
    await ensurePhase1ProductSchema().catch(() => {});
    const products = await prisma.product.findMany({
      where: {
        AND: [{ stockQty: { gt: 0 } }, { isDeleted: false }],
      },
      orderBy: { id: "desc" },
    });
    const normalized = products.map((p: any) => {
      const { cleanDescription, meta } = decodeCompatMetaFromDescription(p.description);
      return {
        ...p,
        stockQty: p.stockQty ?? 0,
        description: cleanDescription,
        productType: p.productType || meta.productType || (p.isUsed ? "REFURBISHED" : "NEW"),
        conditionScore: p.conditionScore ?? meta.conditionScore ?? null,
        ageMonths: p.ageMonths ?? meta.ageMonths ?? null,
        warrantyType: p.warrantyType ?? meta.warrantyType ?? null,
        warrantyExpiry: p.warrantyExpiry ?? meta.warrantyExpiry ?? null,
        warrantyCertificateUrl: p.warrantyCertificateUrl ?? meta.warrantyCertificateUrl ?? null,
      };
    });
    res.json(normalized);
  } catch {
    try {
      try {
        const legacyProducts = await prisma.$queryRaw<
          Array<{
            id: string;
            title: string;
            description: string;
            price: number;
            isUsed: boolean;
            images: string[];
            stockQty: number | null;
            status: string;
            sellerId: string;
            createdAt: Date;
          }>
        >`
          SELECT "id", "title", "description", "price", "isUsed", "images",
            COALESCE("stockQty", 0) AS "stockQty",
            "status", "sellerId", "createdAt"
          FROM "Product"
          WHERE COALESCE("isDeleted", false) = false
            AND COALESCE("stockQty", 0) > 0
          ORDER BY "id" DESC
        `;

        return res.json(
          legacyProducts.map((p) => {
            const { cleanDescription, meta } = decodeCompatMetaFromDescription(p.description);
            return {
              ...p,
              description: cleanDescription,
              productType: meta.productType || (p.isUsed ? "REFURBISHED" : "NEW"),
              conditionScore: meta.conditionScore ?? null,
              ageMonths: meta.ageMonths ?? null,
              warrantyType: meta.warrantyType ?? null,
              warrantyExpiry: meta.warrantyExpiry ?? null,
              warrantyCertificateUrl: meta.warrantyCertificateUrl ?? null,
            };
          }),
        );
      } catch {
        return res.status(500).json({
          error: "Product schema is out of sync. Please run `npx prisma db push` and `npx prisma generate`.",
        });
      }
    } catch {
      res.status(500).json({ error: "Database error" });
    }
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    await ensurePhase1ProductSchema().catch(() => {});
    await ensurePhase2Schema().catch(() => {});
    const { userId, productId, deliveryAddress, deliveryPhone, fullName } = req.body as {
      userId?: string;
      productId?: string;
      deliveryAddress?: string;
      deliveryPhone?: string;
      fullName?: string;
    };
    const trimmedName = String(fullName || "").trim();
    const trimmedAddress = String(deliveryAddress || "").trim();
    if (!productId || !trimmedName || !trimmedAddress || !deliveryPhone) {
      return res.status(400).json({ error: "productId, fullName, deliveryAddress, and deliveryPhone are required." });
    }
    const cleanedPhone = String(deliveryPhone || "").replace(/\D/g, "");
    if (!cleanedPhone || cleanedPhone.length !== 10) {
      return res.status(400).json({ error: "A valid 10-digit phone number is required for delivery." });
    }

    const inserted = await prisma.$transaction(async (tx) => {
      const user = userId ? await tx.user.findUnique({ where: { id: userId } }) : null;
      if (userId && !user) {
        throw new Error("Customer not found.");
      }
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) {
        throw new Error("Product not found.");
      }

      const normalizedType = product.productType || (product.isUsed ? "REFURBISHED" : "NEW");
      if (product.status !== "AVAILABLE") {
        throw new Error("Product is not available for order.");
      }
      if (normalizedType === "NEW") {
        const stockQty = Number(product.stockQty ?? 1);
        if (!Number.isFinite(stockQty) || stockQty <= 0) {
          throw new Error("Product is out of stock.");
        }
        const reservationCutoff = new Date(Date.now() - 30 * 60 * 1000);
        const pendingRows = await tx.$queryRaw<Array<{ count: number }>>`
          SELECT COUNT(*)::int AS count
          FROM "ProductOrder"
          WHERE "productId" = ${product.id}
            AND COALESCE("paymentStatus",'PENDING') <> 'PAID'
            AND "createdAt" >= ${reservationCutoff}
        `;
        const pendingCount = Number(pendingRows[0]?.count || 0);
        if (pendingCount >= stockQty) {
          throw new Error("All units are currently reserved. Please try later.");
        }
      }

      const productImageUrl = Array.isArray(product.images) && product.images[0] ? String(product.images[0]) : "";
      const safeCustomerName = trimmedName || String(user?.name || "Customer").trim() || "Customer";
      const amount = Number(product.price || 0);
      const paymentQR = `upi://pay?pa=${SHOP_UPI_ID}&pn=Golden%20Refrigeration&am=${amount}&cu=INR`;
      const orderId = createUuid();
      const rows = await tx.$queryRaw<Array<any>>`
        INSERT INTO "ProductOrder"
        (
          "id",
          "productId",
          "customerId",
          "productTitle",
          "productImageUrl",
          "price",
          "customerName",
          "deliveryPhone",
          "deliveryAddress",
          "orderStatus",
          "paymentStatus",
          "paymentQR",
          "updatedAt"
        )
        VALUES
        (
          ${orderId},
          ${product.id},
          ${user?.id ?? null},
          ${product.title},
          ${productImageUrl ? cloudinaryOptimizeUrl(productImageUrl) : null},
          ${amount},
          ${safeCustomerName},
          ${cleanedPhone},
          ${trimmedAddress},
          ${"ORDER_PLACED"},
          ${"PENDING"},
          ${paymentQR},
          ${new Date()}
        )
        RETURNING *
      `;
      return { order: rows[0] || null, paymentQR };
    });

    res.status(201).json({
      order: inserted.order,
      paymentQR: inserted.paymentQR,
      statusFlow: ORDER_STATUS_FLOW,
    });
  } catch (error: any) {
    const message = error?.message || "Unknown error";
    if (message.includes("Customer not found")) {
      return res.status(404).json({ error: message });
    }
    if (message.includes("Product not found")) {
      return res.status(404).json({ error: message });
    }
    if (message.includes("not available")) {
      return res.status(400).json({ error: message });
    }
    res.status(500).json({ error: "Failed to place order.", details: message });
  }
};

export const getMyOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized." });
    const rows = await prisma.$queryRaw<Array<any>>`
      SELECT
        o.*,
        p."stockQty" AS "stockQty"
      FROM "ProductOrder" o
      LEFT JOIN "Product" p ON p."id" = o."productId"
      WHERE o."customerId" = ${userId}
      ORDER BY o."createdAt" DESC
    `;
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch customer orders.", details: error?.message || "Unknown error" });
  }
};

export const getAdminOrders = async (_req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const rows = await prisma.$queryRaw<Array<any>>`
      SELECT
        o.*,
        u."name" AS "userName",
        u."email" AS "userEmail"
      FROM "ProductOrder" o
      LEFT JOIN "User" u ON u."id" = o."customerId"
      ORDER BY o."createdAt" DESC
      LIMIT 120
    `;
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch admin orders.", details: error?.message || "Unknown error" });
  }
};

export const updateAdminOrderStatus = async (req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const { id } = req.params;
    const { orderStatus } = req.body as { orderStatus?: string };
    const allowedStatuses = new Set<string>([...ORDER_STATUS_FLOW, "CANCELLED"]);
    if (!orderStatus || !allowedStatuses.has(orderStatus)) {
      return res.status(400).json({ error: "Valid orderStatus is required." });
    }

    const existing = await prisma.$queryRaw<Array<any>>`
      SELECT "id", "paymentStatus"
      FROM "ProductOrder"
      WHERE "id" = ${id}
      LIMIT 1
    `;
    if (!existing.length) return res.status(404).json({ error: "Order not found." });
    const paymentStatus = String(existing[0]?.paymentStatus || "PENDING");
    if (orderStatus !== "ORDER_PLACED" && paymentStatus !== "PAID") {
      return res.status(400).json({ error: "Payment not confirmed yet." });
    }

    const updated = await prisma.$queryRaw<Array<any>>`
      UPDATE "ProductOrder"
      SET "orderStatus" = ${orderStatus}, "updatedAt" = ${new Date()}
      WHERE "id" = ${id}
      RETURNING *
    `;
    res.json({ order: updated[0] });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update order status.", details: error?.message || "Unknown error" });
  }
};

export const createRazorpayOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const { orderId } = req.params as { orderId?: string };
    const userId = req.userId;
    if (!orderId) return res.status(400).json({ error: "orderId is required." });
    if (!userId) return res.status(401).json({ error: "Unauthorized." });
    if (!razorpayKeyId || !razorpayKeySecret) {
      return res.status(500).json({ error: "Razorpay keys are not configured." });
    }

    const rows = await prisma.$queryRaw<Array<any>>`
      SELECT "id", "customerId", "price", "paymentStatus", "productId"
      FROM "ProductOrder"
      WHERE "id" = ${orderId}
      LIMIT 1
    `;
    if (!rows.length) return res.status(404).json({ error: "Order not found." });
    const order = rows[0];
    if (order.customerId && order.customerId !== userId) {
      return res.status(403).json({ error: "Forbidden." });
    }
    if (String(order.paymentStatus || "PENDING") === "PAID") {
      return res.status(400).json({ error: "Order already paid." });
    }

    const product = await prisma.product.findUnique({ where: { id: order.productId } });
    if (!product) return res.status(404).json({ error: "Product not found." });
    const normalizedType = product.productType || (product.isUsed ? "REFURBISHED" : "NEW");
    const currentStock = Number(product.stockQty ?? 0);
    if (
      (normalizedType === "NEW" && currentStock <= 0) ||
      (normalizedType === "REFURBISHED" && (currentStock <= 0 || product.status === "SOLD"))
    ) {
      return res.status(409).json({ error: "Item is out of stock." });
    }

    const amount = Math.round(Number(order.price || 0) * 100);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid order amount." });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: orderId,
    });

    res.json({ razorpayOrder, keyId: razorpayKeyId });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create Razorpay order.", details: error?.message || "Unknown error" });
  }
};

export const verifyRazorpayPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const { orderId } = req.params as { orderId?: string };
    const userId = req.userId;
    if (!orderId) return res.status(400).json({ error: "orderId is required." });
    if (!userId) return res.status(401).json({ error: "Unauthorized." });
    if (!razorpayKeySecret) {
      return res.status(500).json({ error: "Razorpay keys are not configured." });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body as {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    };
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required." });
    }

    const expectedSignature = createHmac("sha256", razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    const providedSignature = String(razorpay_signature);
    const signaturesMatch =
      expectedSignature.length === providedSignature.length &&
      timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(providedSignature));
    if (!signaturesMatch) {
      return res.status(400).json({ error: "Invalid payment signature." });
    }

    const outcome = await prisma.$transaction(async (tx) => {
      const order = await tx.productOrder.findUnique({ where: { id: orderId } });
      if (!order) throw new Error("Order not found.");
      if (order.customerId && order.customerId !== userId) {
        throw new Error("Forbidden.");
      }
      if (order.orderStatus === "CANCELLED") {
        return {
          success: false,
          order,
          message: "Order Cancelled: Item went out of stock. Refund initiated.",
        };
      }
      if (String(order.paymentStatus || "PENDING") === "PAID") {
        return { success: true, order };
      }

      const product = await tx.product.findUnique({ where: { id: order.productId } });
      if (!product) throw new Error("Product not found.");
      const normalizedType = product.productType || (product.isUsed ? "REFURBISHED" : "NEW");
      const currentStock = Number(product.stockQty ?? 0);

      const cancelOrder = async () => {
        const cancelled = await tx.productOrder.update({
          where: { id: orderId },
          data: {
            orderStatus: "CANCELLED",
            paymentStatus: "PAID",
            internalNote: "System: Payment received but stock depleted. Refund needed.",
          },
        });
        return {
          success: false,
          order: cancelled,
          message: "Order Cancelled: Item went out of stock. Refund initiated.",
        };
      };

      if (
        (normalizedType === "NEW" && currentStock <= 0) ||
        (normalizedType === "REFURBISHED" && (currentStock <= 0 || product.status === "SOLD"))
      ) {
        return await cancelOrder();
      }

      const paidOrder = await tx.productOrder.update({
        where: { id: orderId },
        data: {
          paymentStatus: "PAID",
          orderStatus: (order.orderStatus as any) || "ORDER_PLACED",
        },
      });

      if (normalizedType === "REFURBISHED") {
        await tx.product.update({
          where: { id: order.productId },
          data: { status: "SOLD", stockQty: 0 },
        });
      } else {
        const nextStock = currentStock - 1;
        await tx.product.update({
          where: { id: order.productId },
          data: {
            stockQty: nextStock,
            status: nextStock <= 0 ? "SOLD" : "AVAILABLE",
          },
        });
      }

      return { success: true, order: paidOrder };
    });

    if (!outcome.success) {
      return res.status(200).json({
        success: false,
        message: outcome.message,
        order: outcome.order,
      });
    }

    res.json({ success: true, order: outcome.order });
  } catch (error: any) {
    if (error?.message?.includes("Order not found")) {
      return res.status(404).json({ error: "Order not found." });
    }
    if (error?.message?.includes("Product not found")) {
      return res.status(404).json({ error: "Product not found." });
    }
    if (error?.message?.includes("Forbidden")) {
      return res.status(403).json({ error: "Forbidden." });
    }
    if (error?.message?.includes("Stock")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to verify payment.", details: error?.message || "Unknown error" });
  }
};

export const confirmOrderPayment = async (req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const { id } = req.params;
    const updated = await prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<Array<any>>`
        SELECT "id", "productId", "paymentStatus"
        FROM "ProductOrder"
        WHERE "id" = ${id}
        LIMIT 1
      `;
      if (!rows.length) throw new Error("Order not found.");
      const order = rows[0];
      if (String(order.paymentStatus || "PENDING") === "PAID") {
        const refreshed = await tx.$queryRaw<Array<any>>`
          SELECT *
          FROM "ProductOrder"
          WHERE "id" = ${id}
          LIMIT 1
        `;
        return refreshed[0] || order;
      }

      const product = await tx.product.findUnique({ where: { id: order.productId } });
      if (!product) throw new Error("Product not found.");
      const normalizedType = product.productType || (product.isUsed ? "REFURBISHED" : "NEW");

      await tx.$queryRaw`
        UPDATE "ProductOrder"
        SET "paymentStatus" = ${"PAID"}, "updatedAt" = ${new Date()}
        WHERE "id" = ${id}
      `;

      if (normalizedType === "REFURBISHED") {
        await tx.product.updateMany({
          where: { id: order.productId },
          data: { status: "SOLD", stockQty: 0 },
        });
      } else {
        const currentStock = Number(product.stockQty ?? 1);
        if (!Number.isFinite(currentStock) || currentStock <= 0) {
          throw new Error("Stock is already depleted.");
        }
        const nextStock = currentStock - 1;
        await tx.product.update({
          where: { id: order.productId },
          data: {
            stockQty: nextStock,
            status: nextStock <= 0 ? "SOLD" : "AVAILABLE",
          },
        });
      }
      const refreshed = await tx.$queryRaw<Array<any>>`
        SELECT *
        FROM "ProductOrder"
        WHERE "id" = ${id}
        LIMIT 1
      `;
      return refreshed[0];
    });

    res.json({ order: updated });
  } catch (error: any) {
    if (error?.message?.includes("Order not found")) {
      return res.status(404).json({ error: "Order not found." });
    }
    if (error?.message?.includes("Product not found")) {
      return res.status(404).json({ error: "Product not found." });
    }
    if (error?.message?.includes("Stock")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to confirm payment.", details: error?.message || "Unknown error" });
  }
};

export const generateAdminOrderInvoice = async (req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const { id } = req.params;
    const rows = await prisma.$queryRaw<Array<any>>`
      SELECT *
      FROM "ProductOrder"
      WHERE "id" = ${id}
      LIMIT 1
    `;
    if (!rows.length) return res.status(404).json({ error: "Order not found." });

    const invoiceUrl = `${req.protocol}://${req.get("host")}/api/docs/order-invoice/${id}`;
    const updated = await prisma.$queryRaw<Array<any>>`
      UPDATE "ProductOrder"
      SET "invoiceUrl" = ${invoiceUrl}, "updatedAt" = ${new Date()}
      WHERE "id" = ${id}
      RETURNING *
    `;
    res.json({ order: updated[0] || rows[0], invoiceUrl });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to generate order invoice.", details: error?.message || "Unknown error" });
  }
};

export const downloadOrderInvoice = async (req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const { orderId } = req.params;
    const rows = await prisma.$queryRaw<Array<any>>`
      SELECT
        o.*,
        u."email" AS "customerEmail"
      FROM "ProductOrder" o
      LEFT JOIN "User" u ON u."id" = o."customerId"
      WHERE o."id" = ${orderId}
      LIMIT 1
    `;
    if (!rows.length) return res.status(404).json({ error: "Order not found." });
    const order = rows[0];
    const lines = [
      `Order ID: ${order.id}`,
      `Date: ${new Date(order.createdAt).toLocaleString("en-IN")}`,
      `Customer: ${order.customerName || "Customer"}`,
      `Phone: ${order.deliveryPhone || "N/A"}`,
      `Address: ${order.deliveryAddress || "N/A"}`,
      `Product: ${order.productTitle || "N/A"}`,
      `Order Status: ${order.orderStatus || "ORDER_PLACED"}`,
      `Amount: ₹${Number(order.price || 0).toLocaleString("en-IN")}`,
      `Payment Status: ${order.paymentStatus || "PENDING"}`,
    ];
    const pdfBuffer = makeSimplePdfBuffer("Golden Refrigeration - Product Invoice", lines);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="order-invoice-${orderId}.pdf"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to generate order invoice.", details: error?.message || "Unknown error" });
  }
};

export const downloadCustomerOrderInvoice = async (req: AuthenticatedRequest, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const { orderId } = req.params;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized." });

    const rows = await prisma.$queryRaw<Array<any>>`
      SELECT *
      FROM "ProductOrder"
      WHERE "id" = ${orderId}
      LIMIT 1
    `;
    if (!rows.length) return res.status(404).json({ error: "Order not found." });
    const order = rows[0];
    if (!order.customerId || order.customerId !== userId) {
      return res.status(403).json({ error: "Forbidden." });
    }

    const lines = [
      `Order ID: ${order.id}`,
      `Date: ${new Date(order.createdAt).toLocaleString("en-IN")}`,
      `Customer: ${order.customerName || "Customer"}`,
      `Phone: ${order.deliveryPhone || "N/A"}`,
      `Address: ${order.deliveryAddress || "N/A"}`,
      `Product: ${order.productTitle || "N/A"}`,
      `Order Status: ${order.orderStatus || "ORDER_PLACED"}`,
      `Amount: ₹${Number(order.price || 0).toLocaleString("en-IN")}`,
      `Payment Status: ${order.paymentStatus || "PENDING"}`,
    ];
    const pdfBuffer = makeSimplePdfBuffer("Golden Refrigeration - Product Invoice", lines);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="order-invoice-${orderId}.pdf"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to generate order invoice.", details: error?.message || "Unknown error" });
  }
};

export const uploadProductImage = async (req: Request, res: Response) => {
  try {
    const { fileData } = req.body as { fileData?: string };
    if (!fileData || typeof fileData !== "string" || !fileData.startsWith("data:image/")) {
      return res.status(400).json({ error: "Invalid image payload." });
    }
    const base64 = fileData.split(",")[1] || "";
    const padding = (base64.match(/=+$/) || [""])[0].length;
    const bytes = Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
    const MAX_BYTES = 5 * 1024 * 1024;
    if (bytes > MAX_BYTES) {
      return res.status(413).json({ error: "File too large. Max size is 5MB." });
    }

    const uploaded = await cloudinary.uploader.upload(fileData, {
      folder: "refri-smart/products",
      resource_type: "image",
    });
    const imageUrl = cloudinaryOptimizeUrl(uploaded.secure_url);
    res.status(201).json({ imageUrl, originalUrl: uploaded.secure_url });
  } catch (error: any) {
    console.error("Upload Error:", error.message);
    res.status(500).json({ error: "Image upload failed." });
  }
};

export const suggestPrice = async (req: Request, res: Response) => {
  try {
    const { basePrice, conditionScore, ageMonths, productType, title, description } = req.body as {
      basePrice?: number | string;
      conditionScore?: number | string;
      ageMonths?: number | string;
      productType?: "NEW" | "REFURBISHED";
      title?: string;
      description?: string;
    };

    const parsedBase = Number(basePrice || 0);
    const parsedCondition = Number(conditionScore || 8);
    const parsedAge = Number(ageMonths || 0);
    const type = productType === "REFURBISHED" ? "REFURBISHED" : "NEW";

    if (!parsedBase || parsedBase <= 0) {
      return res.status(400).json({ error: "basePrice is required." });
    }

    let formulaSuggested = parsedBase;
    if (type === "REFURBISHED") {
      const agePenalty = Math.min(parsedAge * 0.012, 0.45);
      const conditionBoost = Math.max((parsedCondition - 5) * 0.03, -0.2);
      formulaSuggested = parsedBase * (1 - agePenalty + conditionBoost);
    } else {
      formulaSuggested = parsedBase * 1.02;
    }

    const marketRows = await prisma
      .$queryRaw<Array<{ title: string; price: number; isUsed: boolean }>>`
      SELECT "title", "price", "isUsed"
      FROM "Product"
      WHERE "status" = 'AVAILABLE'
      ORDER BY "id" DESC
      LIMIT 140
    `
      .catch(() => []);

    const queryTokens = tokenize(`${title || ""} ${description || ""}`);
    const tokenSet = new Set(queryTokens);
    const sameTypeRows = marketRows.filter((row) => (type === "REFURBISHED" ? row.isUsed : !row.isUsed));

    const comparables = sameTypeRows
      .map((row) => {
        const rowTokens = tokenize(row.title || "");
        const overlap = rowTokens.filter((t) => tokenSet.has(t)).length;
        const similarity = tokenSet.size > 0 ? overlap / tokenSet.size : 0;
        const weight = 1 + similarity * 2;
        return { ...row, similarity, weight };
      })
      .filter((row) => tokenSet.size === 0 || row.similarity > 0)
      .slice(0, 60);

    const fallbackComparables = comparables.length
      ? comparables
      : sameTypeRows.slice(0, 30).map((row) => ({ ...row, similarity: 0, weight: 1 }));

    const comparablePrices = fallbackComparables.map((c) => Number(c.price)).filter((p) => Number.isFinite(p) && p > 0);
    const marketMedian = median(comparablePrices);

    let marketSuggested = parsedBase;
    if (marketMedian) {
      if (type === "REFURBISHED") {
        const conditionFactor = clamp(0.72 + (parsedCondition - 1) * 0.038, 0.58, 1.08);
        const ageFactor = clamp(1 - parsedAge * 0.01, 0.52, 1.02);
        marketSuggested = marketMedian * conditionFactor * ageFactor;
      } else {
        marketSuggested = marketMedian * 1.01;
      }
    }

    const sampleSize = fallbackComparables.length;
    const marketWeight = marketMedian ? clamp(0.35 + sampleSize * 0.02, 0.35, 0.78) : 0;
    const suggested = marketWeight ? marketSuggested * marketWeight + formulaSuggested * (1 - marketWeight) : formulaSuggested;

    const confidenceScore = clamp(
      (marketMedian ? 0.48 : 0.26) + Math.min(sampleSize * 0.018, 0.34) - (type === "REFURBISHED" ? Math.min(parsedAge * 0.002, 0.1) : 0),
      0.2,
      0.92,
    );
    const spread = confidenceScore >= 0.75 ? 0.08 : confidenceScore >= 0.58 ? 0.12 : 0.18;
    const floor = Math.max(500, Math.round(suggested * (1 - spread)));
    const ceil = Math.round(suggested * (1 + spread));
    const quickSalePrice = Math.max(500, Math.round(suggested * (1 - spread * 0.85)));
    const premiumListingPrice = Math.round(suggested * (1 + spread * 0.9));
    const reasoning = [
      marketMedian
        ? `Used ${sampleSize} comparable ${type === "REFURBISHED" ? "refurbished" : "new"} listings from your live inventory.`
        : "No strong comparables found; applied condition-age formula model.",
      type === "REFURBISHED"
        ? `Adjusted by condition ${parsedCondition}/10 and age ${parsedAge} months.`
        : "Applied new-product margin and market anchor blending.",
      "Final price remains admin decision; this is AI guidance.",
    ];

    res.json({
      suggestedPrice: Math.round(suggested),
      recommendedMin: floor,
      recommendedMax: ceil,
      quickSalePrice,
      premiumListingPrice,
      confidenceScore: Number(confidenceScore.toFixed(2)),
      marketSampleSize: sampleSize,
      reasoning,
      note:
        type === "REFURBISHED"
          ? "Market-aware refurbished pricing with condition and age adjustments."
          : "Market-aware new product pricing guidance.",
    });
  } catch (error: any) {
    console.error("Suggest Price Error:", error.message);
    res.status(500).json({ error: "Price suggestion failed." });
  }
};

export const addProduct = async (req: Request, res: Response) => {
  try {
    await ensurePhase1ProductSchema().catch(() => {});
    const {
      title,
      description,
      price,
      sellerId,
      imageUrl,
      productType,
      conditionScore,
      ageMonths,
      warrantyType,
      warrantyExpiry,
      warrantyCertificateUrl,
      serialNumber,
      stockQty,
    } = req.body as {
      title?: string;
      description?: string;
      price?: number | string;
      sellerId?: string;
      imageUrl?: string;
      productType?: "NEW" | "REFURBISHED";
      conditionScore?: number | string;
      ageMonths?: number | string;
      warrantyType?: "BRAND" | "SHOP";
      warrantyExpiry?: string;
      warrantyCertificateUrl?: string;
      serialNumber?: string;
      stockQty?: number | string;
    };

    const trimmedTitle = String(title || "").trim();
    const trimmedDescription = String(description || "").trim();
    const parsedPrice = Number(price);
    if (!trimmedTitle || !sellerId) {
      return res.status(400).json({ error: "Missing details!" });
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ error: "Price must be a positive number." });
    }

    const normalizedProductType = productType === "REFURBISHED" ? "REFURBISHED" : "NEW";
    const optimizedImageUrl = imageUrl ? cloudinaryOptimizeUrl(imageUrl) : "";
    const conditionRaw = parseOptionalNumber(conditionScore);
    const ageRaw = parseOptionalNumber(ageMonths);
    const stockRaw = parseOptionalNumber(stockQty);
    const parsedCondition = conditionRaw === null ? null : Math.min(10, Math.max(1, Math.round(conditionRaw)));
    const parsedAge = ageRaw === null ? null : Math.max(0, Math.round(ageRaw));
    const parsedWarrantyExpiry = parseFlexibleDate(warrantyExpiry);
    const normalizedWarrantyType = warrantyType === "SHOP" || warrantyType === "BRAND" ? warrantyType : null;
    const compatMeta: ProductCompatMeta = {
      productType: normalizedProductType,
      conditionScore: parsedCondition,
      ageMonths: parsedAge,
      warrantyType: normalizedWarrantyType,
      warrantyExpiry: parsedWarrantyExpiry ? parsedWarrantyExpiry.toISOString() : null,
      warrantyCertificateUrl: warrantyCertificateUrl || null,
    };

    if (conditionRaw !== null && Number.isNaN(conditionRaw)) {
      return res.status(400).json({ error: "Condition score must be a valid number between 1 and 10." });
    }
    if (ageRaw !== null && Number.isNaN(ageRaw)) {
      return res.status(400).json({ error: "Age in months must be a valid number." });
    }
    if (stockRaw !== null && Number.isNaN(stockRaw)) {
      return res.status(400).json({ error: "Stock quantity must be a valid number." });
    }
    if (normalizedProductType === "NEW" && (stockRaw === null || !Number.isFinite(Number(stockRaw)) || Number(stockRaw) < 1)) {
      return res.status(400).json({ error: "Stock quantity is required for new products." });
    }

    const normalizedStock =
      normalizedProductType === "REFURBISHED"
        ? 1
        : Math.max(1, Math.round(Number.isFinite(stockRaw as number) ? Number(stockRaw) : 1));

    const normalizedSerial = String(serialNumber || "").trim();
    const baseData = {
      title: trimmedTitle,
      description: trimmedDescription,
      price: parsedPrice,
      sellerId,
      isUsed: normalizedProductType === "REFURBISHED",
      images: optimizedImageUrl ? [optimizedImageUrl] : [],
      status: "AVAILABLE" as const,
      serialNumber: normalizedSerial || null,
      stockQty: normalizedStock,
    };

    let newProduct: any;
    try {
      newProduct = await prisma.product.create({
        data: {
          ...baseData,
          productType: normalizedProductType,
          conditionScore: parsedCondition,
          ageMonths: parsedAge,
          warrantyType: normalizedWarrantyType,
          warrantyExpiry: parsedWarrantyExpiry,
          warrantyCertificateUrl: warrantyCertificateUrl || null,
        },
      });
    } catch (phaseOneError: any) {
      const msg = String(phaseOneError?.message || "").toLowerCase();
      const isSchemaCompatibilityIssue =
        phaseOneError?.code === "P2021" ||
        phaseOneError?.code === "P2022" ||
        msg.includes("column") ||
        msg.includes("does not exist");

      if (!isSchemaCompatibilityIssue) {
        throw phaseOneError;
      }

      await ensurePhase1ProductSchema().catch(() => {});

      try {
        newProduct = await prisma.product.create({
          data: {
            ...baseData,
            productType: normalizedProductType,
            conditionScore: parsedCondition,
            ageMonths: parsedAge,
            warrantyType: normalizedWarrantyType,
            warrantyExpiry: parsedWarrantyExpiry,
            warrantyCertificateUrl: warrantyCertificateUrl || null,
          },
        });
        return res.status(201).json({ message: "Product added!", product: newProduct });
      } catch {
        // Continue with compatibility fallback below.
      }

      const legacyId = createUuid();
      const fallbackDescription = encodeCompatMetaInDescription(description || "", compatMeta);
      await prisma.$executeRaw`
        INSERT INTO "Product" ("id", "title", "description", "price", "isUsed", "images", "status", "sellerId")
        VALUES (${legacyId}, ${baseData.title}, ${fallbackDescription}, ${baseData.price}, ${baseData.isUsed}, ${baseData.images}, ${baseData.status}, ${baseData.sellerId})
      `;
      newProduct = { id: legacyId, ...baseData, ...compatMeta, description: description || "" };
    }

    res.status(201).json({ message: "Product added!", product: newProduct });
  } catch (error: any) {
    console.error("Add Product Error:", error.message);
    res.status(500).json({
      error: "Failed to save product.",
      details: error?.message || "Unknown server error",
      code: error?.code || null,
    });
  }
};

export const seedDemoProducts = async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.body as { sellerId?: string };
    const seller = sellerId ? await prisma.user.findUnique({ where: { id: sellerId } }) : await prisma.user.findFirst();

    if (!seller) {
      return res.status(400).json({ error: "No seller account found." });
    }

    let created = 0;
    let skipped = 0;

    for (const product of demoProducts) {
      const exists = await prisma.product.findFirst({
        where: { title: product.title },
        select: { id: true },
      });

      if (exists) {
        skipped += 1;
        continue;
      }

      await prisma.product.create({
        data: {
          ...product,
          isUsed: true,
          productType: "REFURBISHED",
          conditionScore: 8,
          ageMonths: 14,
          warrantyType: "SHOP",
          warrantyExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180),
          warrantyCertificateUrl: "",
          sellerId: seller.id,
          status: "AVAILABLE",
        },
      });
      created += 1;
    }

    res.json({ message: "Demo products seeded.", created, skipped });
  } catch (error: any) {
    console.error("Seed Error:", error.message);
    res.status(500).json({ error: "Failed to seed demo products." });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || "");
    const updated = await prisma.product.update({
      where: { id },
      data: { isDeleted: true, stockQty: 0, status: "SOLD" },
    });
    const products = await prisma.product.findMany({
      where: { isDeleted: false },
      orderBy: { id: "desc" },
    });
    res.json({
      message: "Product removed from inventory.",
      product: updated,
      products,
      totalProducts: products.length,
    });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return res.status(404).json({ error: "Product not found." });
    }

    const message = String(error?.message || "");
    const isSchemaMismatch =
      message.includes("Unknown argument `isDeleted`") ||
      (message.includes("isDeleted") && message.includes("column"));

    if (isSchemaMismatch) {
      try {
        const id = String(req.params.id || "");
        const updated = await prisma.product.update({
          where: { id },
          data: { stockQty: 0, status: "SOLD" },
        });
        const products = await prisma.product.findMany({
          orderBy: { id: "desc" },
        });
        return res.json({
          message: "Product removed (legacy schema). Please run `npx prisma db push` and `npx prisma generate`.",
          product: updated,
          products,
          totalProducts: products.length,
          legacy: true,
        });
      } catch (inner: any) {
        return res.status(500).json({
          error: "Failed to delete product.",
          details: String(inner?.message || ""),
        });
      }
    }

    res.status(500).json({ error: "Failed to delete product.", details: message });
  }
};

export const downloadServiceInvoice = async (req: Request, res: Response) => {
  try {
    const bookingId = String(req.params.bookingId || "");
    const booking = (await prisma.serviceBooking.findUnique({ where: { id: bookingId } })) as any;
    if (!booking) return res.status(404).json({ error: "Booking not found." });

    const amount = Number(booking.finalCost || 0);
    const lines = [
      `Booking ID: ${booking.id}`,
      `Appliance: ${booking.appliance}`,
      `Issue: ${booking.issue}`,
      `Status: ${booking.status}`,
      `Amount: ₹${amount.toLocaleString("en-IN")}`,
      `Technician Contact: ${TECHNICIAN_PHONE}`,
    ];
    const pdfBuffer = makeSimplePdfBuffer("Golden Refrigeration - Invoice", lines);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="invoice-${bookingId}.pdf"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to generate invoice.", details: error?.message || "Unknown error" });
  }
};
