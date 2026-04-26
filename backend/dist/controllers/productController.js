import { createHmac, timingSafeEqual } from "node:crypto";
import { cloudinary } from "../config/cloudinary.js";
import { prisma } from "../config/prisma.js";
import { razorpay, razorpayKeyId, razorpayKeySecret } from "../config/razorpay.js";
import { ORDER_STATUS_FLOW, SHOP_UPI_ID, TECHNICIAN_PHONE, clamp, cloudinaryOptimizeUrl, createUuid, decodeCompatMetaFromDescription, demoProducts, encodeCompatMetaInDescription, ensurePhase1ProductSchema, ensurePhase2Schema, makeSimplePdfBuffer, median, parseFlexibleDate, parseOptionalNumber, tokenize, } from "../config/runtime.js";
const ALLOWED_ORDER_STATUSES = new Set([...ORDER_STATUS_FLOW, "CANCELLED"]);
const ORDER_STATUS_NORMALIZATION_MAP = {
    PLACED: "PLACED",
    ORDER_PLACED: "PLACED",
    DISPATCHED: "DISPATCHED",
    OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
    OUTFORDELIVERY: "OUT_FOR_DELIVERY",
    DELIVERED: "DELIVERED",
    CANCELLED: "CANCELLED",
};
const ORDER_RELATION_INCLUDE = {
    product: {
        select: { stockQty: true },
    },
    customer: {
        select: {
            name: true,
            email: true,
            phone: true,
        },
    },
};
const normalizeOrderStatusValue = (value) => {
    const normalized = String(value || "")
        .trim()
        .toUpperCase()
        .replace(/[^A-Z]+/g, "_")
        .replace(/^_+|_+$/g, "");
    return ORDER_STATUS_NORMALIZATION_MAP[normalized] || null;
};
const normalizeEmailLookup = (value) => String(value || "").trim().toLowerCase();
const normalizePhoneLookup = (value) => String(value || "").replace(/\D/g, "");
const serializeOrder = (order) => ({
    id: String(order.id),
    productId: String(order.productId),
    customerId: order.customerId ? String(order.customerId) : null,
    productTitle: String(order.productTitle || ""),
    productImageUrl: order.productImageUrl ? String(order.productImageUrl) : null,
    price: Number(order.price || 0),
    customerName: order.customerName ? String(order.customerName) : null,
    deliveryPhone: String(order.deliveryPhone || ""),
    deliveryAddress: String(order.deliveryAddress || ""),
    status: normalizeOrderStatusValue(order.status ?? order.orderStatus) || "PLACED",
    paymentStatus: String(order.paymentStatus || "PENDING"),
    internalNote: order.internalNote ? String(order.internalNote) : null,
    paymentQR: order.paymentQR ? String(order.paymentQR) : null,
    invoiceUrl: order.invoiceUrl ? String(order.invoiceUrl) : null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    stockQty: order.product?.stockQty ?? order.stockQty ?? null,
    userName: order.customer?.name ?? order.userName ?? null,
    userEmail: order.customer?.email ?? order.userEmail ?? null,
    userPhone: order.customer?.phone ?? order.userPhone ?? null,
});
export const getProducts = async (_req, res) => {
    try {
        await ensurePhase1ProductSchema().catch(() => { });
        // Issue #7 Fix: Always filter by status=AVAILABLE so SOLD products never appear on the storefront.
        const products = await prisma.product.findMany({
            where: {
                AND: [
                    { stockQty: { gt: 0 } },
                    { isDeleted: false },
                    { status: "AVAILABLE" },
                ],
            },
            orderBy: { id: "desc" },
        });
        const normalized = products.map((p) => {
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
    }
    catch {
        try {
            try {
                const legacyProducts = await prisma.$queryRaw `
          SELECT "id", "title", "description", "price", "isUsed", "images",
            COALESCE("stockQty", 0) AS "stockQty",
            "status", "sellerId", "createdAt"
          FROM "Product"
          WHERE COALESCE("isDeleted", false) = false
            AND COALESCE("stockQty", 0) > 0
            AND "status" = 'AVAILABLE'
          ORDER BY "id" DESC
        `;
                return res.json(legacyProducts.map((p) => {
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
                }));
            }
            catch {
                return res.status(500).json({
                    error: "Product schema is out of sync. Please run `npx prisma db push` and `npx prisma generate`.",
                });
            }
        }
        catch {
            res.status(500).json({ error: "Database error" });
        }
    }
};
export const createOrder = async (req, res) => {
    try {
        await ensurePhase1ProductSchema().catch(() => { });
        await ensurePhase2Schema().catch(() => { });
        // Issue #3 + #8 Fix: userId MUST come from the authenticated JWT (req.userId),
        // never from req.body. This prevents impersonation and ensures the price used
        // for the order is always the authoritative DB price, not a user-supplied value.
        const authenticatedUserId = req.userId;
        if (!authenticatedUserId)
            return res.status(401).json({ error: "Unauthorized." });
        const { productId, deliveryAddress, deliveryPhone, fullName } = req.body;
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
            const user = await tx.user.findUnique({ where: { id: authenticatedUserId } });
            if (!user)
                throw new Error("Customer not found.");
            const product = await tx.product.findUnique({ where: { id: productId } });
            if (!product)
                throw new Error("Product not found.");
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
                const pendingRows = await tx.$queryRaw `
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
            // Issue #8 Fix: Always use product.price from DB as the authoritative price.
            // Never trust a price supplied in the request body.
            const amount = Number(product.price || 0);
            const productImageUrl = Array.isArray(product.images) && product.images[0] ? String(product.images[0]) : "";
            const safeCustomerName = trimmedName || String(user.name || "Customer").trim() || "Customer";
            const paymentQR = `upi://pay?pa=${SHOP_UPI_ID}&pn=Golden%20Refrigeration&am=${amount}&cu=INR`;
            const order = await tx.productOrder.create({
                data: {
                    id: createUuid(),
                    productId: product.id,
                    customerId: user.id,
                    productTitle: product.title,
                    productImageUrl: productImageUrl ? cloudinaryOptimizeUrl(productImageUrl) : null,
                    price: amount,
                    customerName: safeCustomerName,
                    deliveryPhone: cleanedPhone,
                    deliveryAddress: trimmedAddress,
                    status: "PLACED",
                    paymentStatus: "PENDING",
                    paymentQR,
                },
            });
            return { order: serializeOrder(order), paymentQR };
        });
        res.status(201).json({
            order: inserted.order,
            paymentQR: inserted.paymentQR,
            statusFlow: ORDER_STATUS_FLOW,
        });
    }
    catch (error) {
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
export const getMyOrders = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized." });
        const orders = await prisma.productOrder.findMany({
            where: { customerId: userId },
            include: ORDER_RELATION_INCLUDE,
            orderBy: { createdAt: "desc" },
        });
        res.json(orders.map((order) => serializeOrder(order)));
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch customer orders.", details: error?.message || "Unknown error" });
    }
};
export const getAdminOrders = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        // Issue #12 Fix: Removed hardcoded LIMIT 120. Added query-param pagination
        // so admins can view all orders without silent data loss.
        const page = Math.max(1, Number(req.query.page || 1));
        const limit = Math.min(500, Math.max(10, Number(req.query.limit || 100)));
        const offset = (page - 1) * limit;
        const orders = await prisma.productOrder.findMany({
            include: ORDER_RELATION_INCLUDE,
            orderBy: { createdAt: "desc" },
            skip: offset,
            take: limit,
        });
        res.json(orders.map((order) => serializeOrder(order)));
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch admin orders.", details: error?.message || "Unknown error" });
    }
};
export const updateAdminOrderStatus = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ error: "Order id is required.", message: "Order id is required." });
        const legacyBody = req.body;
        const status = normalizeOrderStatusValue(legacyBody?.status ?? legacyBody?.orderStatus);
        if (!status || !ALLOWED_ORDER_STATUSES.has(status)) {
            return res.status(400).json({ error: "Valid status is required.", message: "Valid status is required." });
        }
        const existing = await prisma.productOrder.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!existing)
            return res.status(404).json({ error: "Order not found.", message: "Order not found." });
        console.log("Admin selected:", status);
        const updated = await prisma.productOrder.update({
            where: { id },
            data: { status },
        });
        console.log("Saved status:", updated.status);
        res.json({ order: serializeOrder(updated) });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update order status.", details: error?.message || "Unknown error" });
    }
};
export const reassignAdminOrderCustomer = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ error: "Order id is required.", message: "Order id is required." });
        const { customerId, customerEmail, customerPhone } = req.body;
        const normalizedCustomerId = String(customerId || "").trim();
        const normalizedEmail = normalizeEmailLookup(customerEmail);
        const normalizedPhone = normalizePhoneLookup(customerPhone);
        if (!normalizedCustomerId && !normalizedEmail && !normalizedPhone) {
            return res.status(400).json({
                error: "customerId, customerEmail, or customerPhone is required.",
                message: "customerId, customerEmail, or customerPhone is required.",
            });
        }
        const existingOrder = await prisma.productOrder.findUnique({
            where: { id },
            include: ORDER_RELATION_INCLUDE,
        });
        if (!existingOrder)
            return res.status(404).json({ error: "Order not found.", message: "Order not found." });
        const targetUser = (normalizedCustomerId
            ? await prisma.user.findUnique({ where: { id: normalizedCustomerId } })
            : null) ||
            (normalizedEmail
                ? await prisma.user.findUnique({ where: { email: normalizedEmail } })
                : null) ||
            (normalizedPhone
                ? await prisma.user.findFirst({ where: { phone: normalizedPhone } })
                : null);
        if (!targetUser) {
            return res.status(404).json({ error: "Target customer account not found.", message: "Target customer account not found." });
        }
        const updatedOrder = await prisma.productOrder.update({
            where: { id },
            data: { customerId: targetUser.id },
            include: ORDER_RELATION_INCLUDE,
        });
        console.log("Order customer reassigned:", {
            orderId: id,
            fromCustomerId: existingOrder.customerId,
            toCustomerId: targetUser.id,
            deliveryContact: existingOrder.customerName || null,
        });
        res.json({
            message: "Order ownership updated successfully.",
            order: serializeOrder(updatedOrder),
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to reassign order ownership.", details: error?.message || "Unknown error" });
    }
};
export const createRazorpayOrder = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { orderId } = req.params;
        const userId = req.userId;
        if (!orderId)
            return res.status(400).json({ error: "orderId is required." });
        if (!userId)
            return res.status(401).json({ error: "Unauthorized." });
        if (!razorpayKeyId || !razorpayKeySecret) {
            return res.status(500).json({ error: "Razorpay keys are not configured." });
        }
        const rows = await prisma.$queryRaw `
      SELECT "id", "customerId", "price", "paymentStatus", "productId"
      FROM "ProductOrder"
      WHERE "id" = ${orderId}
      LIMIT 1
    `;
        if (!rows.length)
            return res.status(404).json({ error: "Order not found." });
        const order = rows[0];
        if (order.customerId && order.customerId !== userId) {
            return res.status(403).json({ error: "Forbidden." });
        }
        if (String(order.paymentStatus || "PENDING") === "PAID") {
            return res.status(400).json({ error: "Order already paid." });
        }
        const product = await prisma.product.findUnique({ where: { id: order.productId } });
        if (!product)
            return res.status(404).json({ error: "Product not found." });
        const normalizedType = product.productType || (product.isUsed ? "REFURBISHED" : "NEW");
        const currentStock = Number(product.stockQty ?? 0);
        if ((normalizedType === "NEW" && currentStock <= 0) ||
            (normalizedType === "REFURBISHED" && (currentStock <= 0 || product.status === "SOLD"))) {
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
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create Razorpay order.", details: error?.message || "Unknown error" });
    }
};
export const verifyRazorpayPayment = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { orderId } = req.params;
        const userId = req.userId;
        if (!orderId)
            return res.status(400).json({ error: "orderId is required." });
        if (!userId)
            return res.status(401).json({ error: "Unauthorized." });
        if (!razorpayKeySecret) {
            return res.status(500).json({ error: "Razorpay keys are not configured." });
        }
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required." });
        }
        const expectedSignature = createHmac("sha256", razorpayKeySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");
        const providedSignature = String(razorpay_signature);
        const signaturesMatch = expectedSignature.length === providedSignature.length &&
            timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(providedSignature));
        if (!signaturesMatch) {
            return res.status(400).json({ error: "Invalid payment signature." });
        }
        const outcome = await prisma.$transaction(async (tx) => {
            const order = await tx.productOrder.findUnique({ where: { id: orderId } });
            if (!order)
                throw new Error("Order not found.");
            if (order.customerId && order.customerId !== userId) {
                throw new Error("Forbidden.");
            }
            if (order.status === "CANCELLED") {
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
            if (!product)
                throw new Error("Product not found.");
            const normalizedType = product.productType || (product.isUsed ? "REFURBISHED" : "NEW");
            const currentStock = Number(product.stockQty ?? 0);
            const cancelOrder = async () => {
                const cancelled = await tx.productOrder.update({
                    where: { id: orderId },
                    data: {
                        status: "CANCELLED",
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
            if ((normalizedType === "NEW" && currentStock <= 0) ||
                (normalizedType === "REFURBISHED" && (currentStock <= 0 || product.status === "SOLD"))) {
                return await cancelOrder();
            }
            // R1 Fix: Mark order PAID first, then atomically decrement stock.
            // Using conditional UPDATE...WHERE to prevent race conditions with
            // confirmOrderPayment firing concurrently for the same order.
            const paidOrder = await tx.productOrder.update({
                where: { id: orderId },
                data: {
                    paymentStatus: "PAID",
                },
            });
            if (normalizedType === "REFURBISHED") {
                // Atomic: only marks SOLD if still AVAILABLE — prevents parallel double-sell
                await tx.$queryRaw `
          UPDATE "Product"
          SET "status" = 'SOLD'::"ProductStatus", "stockQty" = 0
          WHERE "id" = ${order.productId} AND "status" = 'AVAILABLE'::"ProductStatus"
        `;
            }
            else {
                // Atomic stock decrement with floor guard — prevents going below 0
                const decremented = await tx.$queryRaw `
          UPDATE "Product"
          SET
            "stockQty" = GREATEST("stockQty" - 1, 0),
            "status" = CASE
              WHEN "stockQty" - 1 <= 0 THEN 'SOLD'::"ProductStatus"
              ELSE "status"
            END
          WHERE "id" = ${order.productId} AND "stockQty" > 0
          RETURNING "id"
        `;
                if (!decremented.length) {
                    // Payment received but stock gone — cancel and flag for refund
                    return await cancelOrder();
                }
            }
            return { success: true, order: paidOrder };
        });
        if (!outcome.success) {
            return res.status(200).json({
                success: false,
                message: outcome.message,
                order: serializeOrder(outcome.order),
            });
        }
        res.json({ success: true, order: serializeOrder(outcome.order) });
    }
    catch (error) {
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
export const confirmOrderPayment = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ error: "Order id is required." });
        // Fix #2: This is the admin manual-payment confirmation path.
        // We use SELECT ... FOR UPDATE style locking via a conditional UPDATE to prevent
        // a race condition with verifyRazorpayPayment where both could decrement stock simultaneously.
        const updated = await prisma.$transaction(async (tx) => {
            const order = await tx.productOrder.findUnique({ where: { id } });
            if (!order)
                throw new Error("Order not found.");
            // Idempotency guard: if already paid, return current state without touching stock
            if (String(order.paymentStatus || "PENDING") === "PAID") {
                return order;
            }
            if (String(order.status) === "CANCELLED") {
                throw new Error("Cannot confirm payment for a cancelled order.");
            }
            const product = await tx.product.findUnique({ where: { id: order.productId } });
            if (!product)
                throw new Error("Product not found.");
            const normalizedType = product.productType || (product.isUsed ? "REFURBISHED" : "NEW");
            await tx.productOrder.update({
                where: { id },
                data: { paymentStatus: "PAID" },
            });
            if (normalizedType === "REFURBISHED") {
                // Atomic: only mark SOLD if still AVAILABLE (prevents double-sell)
                await tx.$queryRaw `
          UPDATE "Product"
          SET "status" = 'SOLD'::\"ProductStatus\", "stockQty" = 0
          WHERE "id" = ${order.productId} AND "status" = 'AVAILABLE'::\"ProductStatus\"
        `;
            }
            else {
                // Atomic stock decrement with floor guard — prevents going below 0
                const decremented = await tx.$queryRaw `
          UPDATE "Product"
          SET
            "stockQty" = GREATEST("stockQty" - 1, 0),
            "status" = CASE
              WHEN "stockQty" - 1 <= 0 THEN 'SOLD'::\"ProductStatus\"
              ELSE "status"
            END
          WHERE "id" = ${order.productId} AND "stockQty" > 0
          RETURNING "id"
        `;
                if (!decremented.length) {
                    throw new Error("Stock is already depleted.");
                }
            }
            const refreshed = await tx.productOrder.findUnique({ where: { id } });
            if (!refreshed)
                throw new Error("Order not found.");
            return refreshed;
        });
        res.json({ order: serializeOrder(updated) });
    }
    catch (error) {
        if (error?.message?.includes("Order not found")) {
            return res.status(404).json({ error: "Order not found." });
        }
        if (error?.message?.includes("Product not found")) {
            return res.status(404).json({ error: "Product not found." });
        }
        if (error?.message?.includes("cancelled")) {
            return res.status(400).json({ error: error.message });
        }
        if (error?.message?.includes("Stock")) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: "Failed to confirm payment.", details: error?.message || "Unknown error" });
    }
};
export const generateAdminOrderInvoice = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ error: "Order id is required." });
        const order = await prisma.productOrder.findUnique({ where: { id } });
        if (!order)
            return res.status(404).json({ error: "Order not found." });
        const invoiceUrl = `${req.protocol}://${req.get("host")}/api/docs/order-invoice/${id}`;
        const updated = await prisma.productOrder.update({
            where: { id },
            data: { invoiceUrl },
        });
        res.json({ order: serializeOrder(updated), invoiceUrl });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to generate order invoice.", details: error?.message || "Unknown error" });
    }
};
export const downloadOrderInvoice = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { orderId } = req.params;
        if (!orderId)
            return res.status(400).json({ error: "orderId is required." });
        const order = await prisma.productOrder.findUnique({
            where: { id: orderId },
            include: {
                customer: {
                    select: { email: true },
                },
            },
        });
        if (!order)
            return res.status(404).json({ error: "Order not found." });
        const lines = [
            `Order ID: ${order.id}`,
            `Date: ${new Date(order.createdAt).toLocaleString("en-IN")}`,
            `Customer: ${order.customerName || "Customer"}`,
            `Phone: ${order.deliveryPhone || "N/A"}`,
            `Address: ${order.deliveryAddress || "N/A"}`,
            `Product: ${order.productTitle || "N/A"}`,
            `Order Status: ${order.status || "PLACED"}`,
            `Amount: Rs. ${Number(order.price || 0).toLocaleString("en-IN")}`,
            `Payment Status: ${order.paymentStatus || "PENDING"}`,
        ];
        const pdfBuffer = makeSimplePdfBuffer("Golden Refrigeration - Product Invoice", lines);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="order-invoice-${orderId}.pdf"`);
        res.send(pdfBuffer);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to generate order invoice.", details: error?.message || "Unknown error" });
    }
};
export const downloadCustomerOrderInvoice = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { orderId } = req.params;
        const userId = req.userId;
        if (!orderId)
            return res.status(400).json({ error: "orderId is required." });
        if (!userId)
            return res.status(401).json({ error: "Unauthorized." });
        const order = await prisma.productOrder.findUnique({ where: { id: orderId } });
        if (!order)
            return res.status(404).json({ error: "Order not found." });
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
            `Order Status: ${order.status || "PLACED"}`,
            `Amount: Rs. ${Number(order.price || 0).toLocaleString("en-IN")}`,
            `Payment Status: ${order.paymentStatus || "PENDING"}`,
        ];
        const pdfBuffer = makeSimplePdfBuffer("Golden Refrigeration - Product Invoice", lines);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="order-invoice-${orderId}.pdf"`);
        res.send(pdfBuffer);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to generate order invoice.", details: error?.message || "Unknown error" });
    }
};
export const uploadProductImage = async (req, res) => {
    try {
        const { fileData } = req.body;
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
    }
    catch (error) {
        console.error("Upload Error:", error.message);
        res.status(500).json({ error: "Image upload failed." });
    }
};
export const suggestPrice = async (req, res) => {
    try {
        const { basePrice, conditionScore, ageMonths, productType, title, description } = req.body;
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
        }
        else {
            formulaSuggested = parsedBase * 1.02;
        }
        const marketRows = await prisma
            .$queryRaw `
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
            }
            else {
                marketSuggested = marketMedian * 1.01;
            }
        }
        const sampleSize = fallbackComparables.length;
        const marketWeight = marketMedian ? clamp(0.35 + sampleSize * 0.02, 0.35, 0.78) : 0;
        const suggested = marketWeight ? marketSuggested * marketWeight + formulaSuggested * (1 - marketWeight) : formulaSuggested;
        const confidenceScore = clamp((marketMedian ? 0.48 : 0.26) + Math.min(sampleSize * 0.018, 0.34) - (type === "REFURBISHED" ? Math.min(parsedAge * 0.002, 0.1) : 0), 0.2, 0.92);
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
            note: type === "REFURBISHED"
                ? "Market-aware refurbished pricing with condition and age adjustments."
                : "Market-aware new product pricing guidance.",
        });
    }
    catch (error) {
        console.error("Suggest Price Error:", error.message);
        res.status(500).json({ error: "Price suggestion failed." });
    }
};
export const addProduct = async (req, res) => {
    try {
        await ensurePhase1ProductSchema().catch(() => { });
        const { title, description, price, sellerId, imageUrl, productType, conditionScore, ageMonths, warrantyType, warrantyExpiry, warrantyCertificateUrl, serialNumber, stockQty, } = req.body;
        const trimmedTitle = String(title || "").trim();
        const trimmedDescription = String(description || "").trim();
        const parsedPrice = Number(price);
        // Fix #17: Run all field validations BEFORE constructing any objects.
        // Previously NaN checks happened after compatMeta was built, creating misleading error order.
        if (!trimmedTitle || !sellerId) {
            return res.status(400).json({ error: "Missing details!" });
        }
        if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
            return res.status(400).json({ error: "Price must be a positive number." });
        }
        const normalizedProductType = productType === "REFURBISHED" ? "REFURBISHED" : "NEW";
        const conditionRaw = parseOptionalNumber(conditionScore);
        const ageRaw = parseOptionalNumber(ageMonths);
        const stockRaw = parseOptionalNumber(stockQty);
        // Validate parsed numerics immediately after parsing — before using them below
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
        // All validations passed — safe to build objects now
        const optimizedImageUrl = imageUrl ? cloudinaryOptimizeUrl(imageUrl) : "";
        const parsedCondition = conditionRaw === null ? null : Math.min(10, Math.max(1, Math.round(conditionRaw)));
        const parsedAge = ageRaw === null ? null : Math.max(0, Math.round(ageRaw));
        const parsedWarrantyExpiry = parseFlexibleDate(warrantyExpiry);
        const normalizedWarrantyType = warrantyType === "SHOP" || warrantyType === "BRAND" ? warrantyType : null;
        const compatMeta = {
            productType: normalizedProductType,
            conditionScore: parsedCondition,
            ageMonths: parsedAge,
            warrantyType: normalizedWarrantyType,
            warrantyExpiry: parsedWarrantyExpiry ? parsedWarrantyExpiry.toISOString() : null,
            warrantyCertificateUrl: warrantyCertificateUrl || null,
        };
        const normalizedStock = normalizedProductType === "REFURBISHED"
            ? 1
            : Math.max(1, Math.round(Number.isFinite(stockRaw) ? Number(stockRaw) : 1));
        const normalizedSerial = String(serialNumber || "").trim();
        const baseData = {
            title: trimmedTitle,
            description: trimmedDescription,
            price: parsedPrice,
            sellerId,
            isUsed: normalizedProductType === "REFURBISHED",
            images: optimizedImageUrl ? [optimizedImageUrl] : [],
            status: "AVAILABLE",
            serialNumber: normalizedSerial || null,
            stockQty: normalizedStock,
        };
        let newProduct;
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
        }
        catch (phaseOneError) {
            const msg = String(phaseOneError?.message || "").toLowerCase();
            const isSchemaCompatibilityIssue = phaseOneError?.code === "P2021" ||
                phaseOneError?.code === "P2022" ||
                msg.includes("column") ||
                msg.includes("does not exist");
            if (!isSchemaCompatibilityIssue) {
                throw phaseOneError;
            }
            await ensurePhase1ProductSchema().catch(() => { });
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
            }
            catch {
                // Continue with compatibility fallback below.
            }
            const legacyId = createUuid();
            const fallbackDescription = encodeCompatMetaInDescription(description || "", compatMeta);
            await prisma.$executeRaw `
        INSERT INTO "Product" ("id", "title", "description", "price", "isUsed", "images", "status", "sellerId")
        VALUES (${legacyId}, ${baseData.title}, ${fallbackDescription}, ${baseData.price}, ${baseData.isUsed}, ${baseData.images}, ${baseData.status}, ${baseData.sellerId})
      `;
            newProduct = { id: legacyId, ...baseData, ...compatMeta, description: description || "" };
        }
        res.status(201).json({ message: "Product added!", product: newProduct });
    }
    catch (error) {
        console.error("Add Product Error:", error.message);
        res.status(500).json({
            error: "Failed to save product.",
            details: error?.message || "Unknown server error",
            code: error?.code || null,
        });
    }
};
export const seedDemoProducts = async (req, res) => {
    try {
        const { sellerId } = req.body;
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
    }
    catch (error) {
        console.error("Seed Error:", error.message);
        res.status(500).json({ error: "Failed to seed demo products." });
    }
};
export const deleteProduct = async (req, res) => {
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
    }
    catch (error) {
        if (error?.code === "P2025") {
            return res.status(404).json({ error: "Product not found." });
        }
        const message = String(error?.message || "");
        const isSchemaMismatch = message.includes("Unknown argument `isDeleted`") ||
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
            }
            catch (inner) {
                return res.status(500).json({
                    error: "Failed to delete product.",
                    details: String(inner?.message || ""),
                });
            }
        }
        res.status(500).json({ error: "Failed to delete product.", details: message });
    }
};
export const downloadServiceInvoice = async (req, res) => {
    try {
        const bookingId = String(req.params.bookingId || "");
        const booking = (await prisma.serviceBooking.findUnique({ where: { id: bookingId } }));
        if (!booking)
            return res.status(404).json({ error: "Booking not found." });
        const amount = Number(booking.finalCost || 0);
        const lines = [
            `Booking ID: ${booking.id}`,
            `Appliance: ${booking.appliance}`,
            `Issue: ${booking.issue}`,
            `Status: ${booking.status}`,
            `Amount: Rs. ${amount.toLocaleString("en-IN")}`,
            `Technician Contact: ${TECHNICIAN_PHONE}`,
        ];
        const pdfBuffer = makeSimplePdfBuffer("Golden Refrigeration - Invoice", lines);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="invoice-${bookingId}.pdf"`);
        res.send(pdfBuffer);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to generate invoice.", details: error?.message || "Unknown error" });
    }
};
