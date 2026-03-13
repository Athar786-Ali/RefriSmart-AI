import type { Request, Response } from "express";
import { cloudinary } from "../config/cloudinary.js";
import { prisma } from "../config/prisma.js";
import {
  SHOP_UPI_ID,
  TECHNICIAN_PHONE,
  cloudinaryOptimizeUrl,
  createUuid,
  ensurePhase1ProductSchema,
  ensurePhase2Schema,
  generateSuggestedSlots,
  inferMediaTypeFromUrl,
  makeSimplePdfBuffer,
} from "../config/runtime.js";

const getBookingsWithAssignment = async (customerId: string) => {
  const bookings = await prisma.serviceBooking.findMany({
    where: { customerId },
    orderBy: { scheduledAt: "desc" },
  });
  const bookingIds = bookings.map((b) => b.id);
  if (!bookingIds.length) return [];

  const assignmentRows = await prisma.$queryRaw<Array<{ bookingId: string; technicianId: string; pincode: string; routeNote: string }>>`
      SELECT "bookingId", "technicianId", COALESCE("pincode",'') AS "pincode", COALESCE("routeNote",'') AS "routeNote"
      FROM "ServiceAssignment"
    `;
  const bookingIdSet = new Set(bookingIds);
  const assignments = assignmentRows.filter((r) => bookingIdSet.has(r.bookingId));
  const technicians = await prisma.$queryRaw<Array<{ id: string; name: string; phone: string }>>`
      SELECT "id", "name", "phone" FROM "Technician"
    `;
  const assignMap = new Map(assignments.map((a) => [a.bookingId, a]));
  const techMap = new Map(technicians.map((t) => [t.id, t]));

  return bookings.map((b) => {
    const assign = assignMap.get(b.id);
    const tech = assign ? techMap.get(assign.technicianId) : null;
    return {
      ...b,
      technician: tech || null,
      pincode: assign?.pincode || null,
      routeNote: assign?.routeNote || null,
    };
  });
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.userId || "");
    const history = await prisma.serviceBooking.findMany({
      where: { customerId: userId },
      orderBy: { scheduledAt: "desc" },
    });
    res.json(history);
  } catch {
    res.status(500).json({ error: "Failed to fetch history." });
  }
};

export const getBookingSlots = async (req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const pincode = String(req.query.pincode || "").trim();
    const dateParam = String(req.query.date || "").trim();
    const targetDate = dateParam ? new Date(dateParam) : undefined;

    const techRows = await prisma.$queryRaw<Array<{ id: string; name: string; phone: string; pincode: string }>>`
      SELECT "id", "name", "phone", "pincode"
      FROM "Technician"
      WHERE "active" = TRUE
      ORDER BY "id" ASC
    `;
    const technicians = pincode
      ? techRows.filter((t) => t.pincode === pincode || t.pincode.slice(0, 3) === pincode.slice(0, 3))
      : techRows;
    const slots = generateSuggestedSlots(targetDate).map((slot) => ({
      ...slot,
      technician: technicians[0] || null,
    }));
    res.json({ slots, technicians: technicians.slice(0, 5) });
  } catch {
    res.status(500).json({ error: "Failed to fetch slots." });
  }
};

export const createBooking = async (req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const { userId, appliance, issue, aiDiagnosis, slot, pincode } = req.body as {
      userId?: string;
      appliance?: string;
      issue?: string;
      aiDiagnosis?: string;
      slot?: string;
      pincode?: string;
    };

    if (!userId || !appliance || !issue) {
      return res.status(400).json({ error: "userId, appliance and issue are required." });
    }

    const scheduledAt = slot ? new Date(slot) : new Date(Date.now() + 2 * 60 * 60 * 1000);
    if (Number.isNaN(scheduledAt.getTime())) {
      return res.status(400).json({ error: "Invalid slot selected." });
    }

    const techRows = await prisma.$queryRaw<Array<{ id: string; name: string; phone: string; pincode: string }>>`
      SELECT "id", "name", "phone", "pincode"
      FROM "Technician"
      WHERE "active" = TRUE
      ORDER BY "id" ASC
    `;
    const selectedTech =
      techRows.find((t) => pincode && (t.pincode === pincode || t.pincode.slice(0, 3) === pincode.slice(0, 3))) ||
      techRows[0] ||
      { id: "tech-1", name: "Assigned Technician", phone: TECHNICIAN_PHONE, pincode: pincode || "N/A" };

    const booking = await prisma.serviceBooking.create({
      data: {
        customer: { connect: { id: userId } },
        appliance,
        issue,
        aiDiagnosis: aiDiagnosis || null,
        status: "PENDING",
        scheduledAt,
      },
    });

    await prisma.$executeRaw`
      INSERT INTO "ServiceAssignment" ("bookingId", "technicianId", "pincode", "routeNote")
      VALUES (${booking.id}, ${selectedTech.id}, ${pincode || selectedTech.pincode}, ${"Auto allocated by pincode and availability"})
      ON CONFLICT ("bookingId") DO UPDATE
      SET "technicianId" = EXCLUDED."technicianId",
          "pincode" = EXCLUDED."pincode",
          "routeNote" = EXCLUDED."routeNote"
    `;
    await prisma.$executeRaw`
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (${createUuid()}, ${booking.id}, ${"REQUEST_RECEIVED"}, ${"Request received from customer"})
    `;
    await prisma.$executeRaw`
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (${createUuid()}, ${booking.id}, ${"ASSIGNED"}, ${`Assigned to ${selectedTech.name}`})
    `;

    res.status(201).json({
      booking,
      message: "Technician booking created.",
      assignedTechnician: selectedTech,
      contact: {
        phone: selectedTech.phone || TECHNICIAN_PHONE,
        call: `tel:${selectedTech.phone || TECHNICIAN_PHONE}`,
        whatsapp: `https://wa.me/91${selectedTech.phone || TECHNICIAN_PHONE}`,
        sms: `sms:+91${selectedTech.phone || TECHNICIAN_PHONE}`,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create booking.", details: error?.message || "Unknown error" });
  }
};

export const bookService = async (req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const { userId, appliance, issue, address, lat, lng, slot, pincode, fullName, phoneNumber, guestName, guestPhone } = req.body as {
      userId?: string;
      appliance?: string;
      issue?: string;
      address?: string;
      lat?: number | string;
      lng?: number | string;
      slot?: string;
      pincode?: string;
      fullName?: string;
      phoneNumber?: string;
      guestName?: string;
      guestPhone?: string;
    };
    if (!appliance || !issue) {
      return res.status(400).json({ error: "appliance and issue are required." });
    }
    if (!pincode || typeof pincode !== "string") {
      return res.status(400).json({ error: "Pincode is required." });
    }
    const SERVICE_PIN_PREFIXES = ["500", "506"];
    if (!SERVICE_PIN_PREFIXES.some((prefix) => pincode.trim().startsWith(prefix))) {
      return res.status(400).json({ error: "Sorry, your location is outside our current service area." });
    }

    const scheduledAt = slot ? new Date(slot) : new Date(Date.now() + 2 * 60 * 60 * 1000);
    if (Number.isNaN(scheduledAt.getTime())) {
      return res.status(400).json({ error: "Invalid slot selected." });
    }

    const techRows = await prisma.$queryRaw<Array<{ id: string; name: string; phone: string; pincode: string }>>`
      SELECT "id", "name", "phone", "pincode"
      FROM "Technician"
      WHERE "active" = TRUE
      ORDER BY "id" ASC
    `;
    const selectedTech =
      techRows.find((t) => pincode && (t.pincode === pincode || t.pincode.slice(0, 3) === pincode.slice(0, 3))) ||
      techRows[0] ||
      { id: "tech-1", name: "Assigned Technician", phone: TECHNICIAN_PHONE, pincode: pincode || "N/A" };

    let resolvedCustomerId: string | null = null;
    let resolvedName = String(fullName || "").trim();
    let resolvedPhone = String(phoneNumber || "").trim();
    let resolvedGuestName = String(guestName || "").trim();
    let resolvedGuestPhone = String(guestPhone || "").trim();

    if (userId) {
      const existingUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!existingUser) return res.status(404).json({ error: "User not found." });
      resolvedCustomerId = userId;
      resolvedName = resolvedName || existingUser.name || "Customer";
      resolvedPhone = resolvedPhone || "Not provided";
    } else {
      resolvedGuestName = resolvedGuestName || resolvedName;
      resolvedGuestPhone = resolvedGuestPhone || resolvedPhone;
      if (!resolvedGuestName || !resolvedGuestPhone) {
        return res.status(400).json({ error: "guestName and guestPhone are required." });
      }
      resolvedName = resolvedGuestName;
      resolvedPhone = resolvedGuestPhone;
    }

    const bookingId = createUuid();
    const inserted = await prisma.$queryRaw<Array<any>>`
      INSERT INTO "ServiceBooking"
      (
        "id",
        "customerId",
        "guestName",
        "guestPhone",
        "appliance",
        "issue",
        "status",
        "scheduledAt",
        "address",
        "contactName",
        "contactPhone",
        "locationLat",
        "locationLng"
      )
      VALUES
      (
        ${bookingId},
        ${resolvedCustomerId},
        ${resolvedCustomerId ? null : resolvedName},
        ${resolvedCustomerId ? null : resolvedPhone},
        ${appliance},
        ${issue},
        ${"PENDING"}::"Status",
        ${scheduledAt},
        ${address || null},
        ${resolvedName},
        ${resolvedPhone},
        ${lat !== undefined && lat !== null && String(lat) !== "" ? Number(lat) : null},
        ${lng !== undefined && lng !== null && String(lng) !== "" ? Number(lng) : null}
      )
      RETURNING *
    `;
    const booking = inserted[0];

    await prisma.$executeRaw`
      INSERT INTO "ServiceAssignment" ("bookingId", "technicianId", "pincode", "routeNote")
      VALUES (${booking.id}, ${selectedTech.id}, ${pincode || selectedTech.pincode}, ${"Auto allocated by pincode and availability"})
      ON CONFLICT ("bookingId") DO UPDATE
      SET "technicianId" = EXCLUDED."technicianId",
          "pincode" = EXCLUDED."pincode",
          "routeNote" = EXCLUDED."routeNote"
    `;
    await prisma.$executeRaw`
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (${createUuid()}, ${booking.id}, ${"PENDING"}, ${"Request received from customer"})
    `;

    res.status(201).json({
      booking,
      assignedTechnician: selectedTech,
      contact: {
        phone: selectedTech.phone || TECHNICIAN_PHONE,
        call: `tel:${selectedTech.phone || TECHNICIAN_PHONE}`,
        whatsapp: `https://wa.me/91${selectedTech.phone || TECHNICIAN_PHONE}`,
        sms: `sms:+91${selectedTech.phone || TECHNICIAN_PHONE}`,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to book service.", details: error?.message || "Unknown error" });
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const id = String(req.params.id || "");
    const { status } = req.body as { status?: "PENDING" | "ASSIGNED" | "OUT_FOR_REPAIR" | "REPAIRING" | "FIXED" | "COMPLETED" };
    if (!status || !["PENDING", "ASSIGNED", "OUT_FOR_REPAIR", "REPAIRING", "FIXED", "COMPLETED"].includes(status)) {
      return res.status(400).json({ error: "Valid status is required." });
    }

    const updated = await prisma.serviceBooking.update({
      where: { id },
      data: { status: status as any },
    });
    await prisma.$executeRaw`
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (${createUuid()}, ${id}, ${status}, ${`Status updated to ${status}`})
    `;
    res.json({ booking: updated });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update status.", details: error?.message || "Unknown error" });
  }
};

export const rescheduleBooking = async (req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const id = String(req.params.id || "");
    const { slot } = req.body as { slot?: string };
    if (!slot) return res.status(400).json({ error: "slot is required." });
    const nextDate = new Date(slot);
    if (Number.isNaN(nextDate.getTime())) {
      return res.status(400).json({ error: "Invalid slot selected." });
    }

    const updated = await prisma.serviceBooking.update({
      where: { id },
      data: { scheduledAt: nextDate },
    });
    await prisma.$executeRaw`
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (${createUuid()}, ${id}, ${"RESCHEDULED"}, ${`Rescheduled to ${nextDate.toISOString()}`})
    `;
    res.json({ booking: updated, message: "Booking rescheduled." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to reschedule.", details: error?.message || "Unknown error" });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const id = String(req.params.id || "");
    const updated = await prisma.serviceBooking.update({
      where: { id },
      data: { status: "COMPLETED" },
    });
    await prisma.$executeRaw`
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (${createUuid()}, ${id}, ${"COMPLETED"}, ${"Closed by user/admin"})
    `;
    res.json({ booking: updated, message: "Booking closed." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to cancel booking.", details: error?.message || "Unknown error" });
  }
};

export const getBookingTimeline = async (req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const { bookingId } = req.params;
    const events = await prisma.$queryRaw<Array<{ status: string; note: string; createdAt: Date }>>`
      SELECT "status", COALESCE("note", '') AS "note", "createdAt"
      FROM "ServiceEvent"
      WHERE "bookingId" = ${bookingId}
      ORDER BY "createdAt" ASC
    `;
    res.json({ timeline: events });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch timeline.", details: error?.message || "Unknown error" });
  }
};

export const sendBookingOtp = async (req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const { id } = req.params;
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.$executeRaw`
      INSERT INTO "ServiceOtp" ("id", "bookingId", "otp", "expiresAt", "verified")
      VALUES (${createUuid()}, ${id}, ${otp}, ${expiresAt}, ${false})
    `;
    res.json({
      message: "Completion OTP generated.",
      otpPreview: otp,
      reminder: {
        whatsapp: `https://wa.me/91${TECHNICIAN_PHONE}?text=Booking%20${id}%20OTP%20${otp}`,
        sms: `sms:+91${TECHNICIAN_PHONE}?body=Booking ${id} OTP ${otp}`,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to generate OTP.", details: error?.message || "Unknown error" });
  }
};

export const verifyBookingOtp = async (req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const id = String(req.params.id || "");
    const { otp } = req.body as { otp?: string };
    if (!otp) return res.status(400).json({ error: "otp is required." });

    const rows = await prisma.$queryRaw<Array<{ id: string; otp: string; expiresAt: Date; verified: boolean }>>`
      SELECT "id", "otp", "expiresAt", "verified"
      FROM "ServiceOtp"
      WHERE "bookingId" = ${id}
      ORDER BY "createdAt" DESC
      LIMIT 1
    `;
    const latest = rows[0];
    if (!latest) return res.status(404).json({ error: "OTP not found." });
    if (latest.verified) return res.status(400).json({ error: "OTP already used." });
    if (new Date(latest.expiresAt).getTime() < Date.now()) return res.status(400).json({ error: "OTP expired." });
    if (String(latest.otp) !== String(otp)) return res.status(400).json({ error: "Invalid OTP." });

    await prisma.$executeRaw`UPDATE "ServiceOtp" SET "verified" = TRUE WHERE "id" = ${latest.id}`;
    const booking = await prisma.serviceBooking.update({
      where: { id },
      data: { status: "COMPLETED" },
    });
    await prisma.$executeRaw`
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (${createUuid()}, ${id}, ${"COMPLETED"}, ${"OTP verified and service completed"})
    `;
    res.json({ message: "OTP verified. Service marked completed.", booking });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to verify OTP.", details: error?.message || "Unknown error" });
  }
};

export const getMyBookingsByPath = async (req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const userId = String(req.params.userId || "");
    const bookings = await getBookingsWithAssignment(userId);
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch bookings.", details: error?.message || "Unknown error" });
  }
};

export const getMyBookingsByQuery = async (req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const userId = String(req.query.userId || "").trim();
    if (!userId) return res.status(400).json({ error: "userId is required." });
    const bookings = await getBookingsWithAssignment(userId);
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch bookings.", details: error?.message || "Unknown error" });
  }
};

export const updateAdminService = async (req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const id = String(req.params.id || "");
    const { status, finalCost } = req.body as {
      status?: "PENDING" | "ASSIGNED" | "OUT_FOR_REPAIR" | "REPAIRING" | "FIXED" | "COMPLETED";
      finalCost?: number | string;
    };
    if (!status || !["PENDING", "ASSIGNED", "OUT_FOR_REPAIR", "REPAIRING", "FIXED", "COMPLETED"].includes(status)) {
      return res.status(400).json({ error: "Valid status is required." });
    }

    const parsedCost = finalCost === undefined || finalCost === null || String(finalCost).trim() === "" ? null : Number(finalCost);
    if (parsedCost !== null && (!Number.isFinite(parsedCost) || parsedCost < 0)) {
      return res.status(400).json({ error: "finalCost must be a valid positive number." });
    }

    const booking = (await prisma.serviceBooking.findUnique({ where: { id } })) as any;
    if (!booking) return res.status(404).json({ error: "Booking not found." });

    const amountToUse = status === "FIXED" ? Number(parsedCost ?? booking.finalCost ?? 0) : Number(booking.finalCost ?? 0);
    const paymentQR = status === "FIXED" && amountToUse > 0
      ? `upi://pay?pa=${SHOP_UPI_ID}&pn=MD%20ATHAR%20ALI&am=${amountToUse}&cu=INR`
      : booking.paymentQR;
    const invoiceUrl = status === "FIXED" ? `${req.protocol}://${req.get("host")}/api/docs/invoice/${id}` : booking.invoiceUrl;

    const updated = await prisma.$queryRaw<Array<any>>`
      UPDATE "ServiceBooking"
      SET
        "status" = ${status}::"Status",
        "finalCost" = ${status === "FIXED" ? amountToUse : parsedCost ?? booking.finalCost},
        "paymentQR" = ${paymentQR || null},
        "invoiceUrl" = ${invoiceUrl || null}
      WHERE "id" = ${id}
      RETURNING *
    `;
    await prisma.$executeRaw`
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (
        ${createUuid()},
        ${id},
        ${status},
        ${status === "FIXED" ? `Final estimate locked at ₹${amountToUse}. Payment request generated.` : `Admin updated status to ${status}`}
      )
    `;

    res.json({
      booking: updated[0] || null,
      paymentQR: paymentQR || null,
      invoiceUrl: invoiceUrl || null,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update service booking.", details: error?.message || "Unknown error" });
  }
};

export const saveServiceRating = async (req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const { id } = req.params;
    const rating = Number(req.body?.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "rating must be between 1 and 5." });
    }

    const updated = await prisma.$queryRaw<Array<any>>`
      UPDATE "ServiceBooking"
      SET "rating" = ${Math.round(rating)}
      WHERE "id" = ${id}
      RETURNING *
    `;
    if (!updated.length) return res.status(404).json({ error: "Booking not found." });

    await prisma.$executeRaw`
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (${createUuid()}, ${id}, ${"COMPLETED"}, ${`Customer submitted rating ${Math.round(rating)}/5`})
    `;
    res.json({ booking: updated[0] });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to save rating.", details: error?.message || "Unknown error" });
  }
};

export const uploadGalleryItem = async (req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const { imageUrl, caption, fileData, mediaType } = req.body as {
      imageUrl?: string;
      caption?: string;
      fileData?: string;
      mediaType?: "image" | "video";
    };

    let finalUrl = (imageUrl || "").trim();
    let resolvedMediaType: "image" | "video" =
      mediaType === "video" ? "video" : mediaType === "image" ? "image" : inferMediaTypeFromUrl(finalUrl);

    if (fileData?.startsWith("data:video/")) resolvedMediaType = "video";
    if (fileData?.startsWith("data:image/")) resolvedMediaType = "image";

    if (!finalUrl && fileData && (fileData.startsWith("data:image/") || fileData.startsWith("data:video/"))) {
      const uploaded = await cloudinary.uploader.upload(fileData, {
        folder: "refri-smart/gallery",
        resource_type: resolvedMediaType,
      });
      finalUrl = resolvedMediaType === "image" ? cloudinaryOptimizeUrl(uploaded.secure_url) : uploaded.secure_url;
    }

    if (!finalUrl) return res.status(400).json({ error: "imageUrl or media fileData is required." });

    const id = createUuid();
    const storedUrl = resolvedMediaType === "image" ? cloudinaryOptimizeUrl(finalUrl) : finalUrl;
    await prisma.$executeRaw`
      INSERT INTO "Gallery" ("id", "imageUrl", "mediaType", "caption")
      VALUES (${id}, ${storedUrl}, ${resolvedMediaType}, ${caption || null})
    `;
    res.status(201).json({ id, imageUrl: storedUrl, mediaType: resolvedMediaType, caption: caption || null });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to upload gallery item.", details: error?.message || "Unknown error" });
  }
};

export const getGallery = async (_req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const rows = await prisma.$queryRaw<Array<{ id: string; imageUrl: string; mediaType: string | null; caption: string | null; createdAt: Date }>>`
      SELECT "id", "imageUrl", "mediaType", "caption", "createdAt"
      FROM "Gallery"
      ORDER BY "createdAt" DESC
    `;
    res.json(
      rows.map((row) => ({
        ...row,
        mediaType: row.mediaType === "video" ? "video" : "image",
        imageUrl: row.mediaType === "video" ? row.imageUrl : cloudinaryOptimizeUrl(row.imageUrl),
      })),
    );
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch gallery.", details: error?.message || "Unknown error" });
  }
};

export const deleteGalleryItem = async (req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const { id } = req.params;
    const rows = await prisma.$queryRaw<Array<{ id: string; imageUrl: string; mediaType: string | null }>>`
      SELECT "id", "imageUrl", "mediaType"
      FROM "Gallery"
      WHERE "id" = ${id}
      LIMIT 1
    `;
    if (!rows.length) return res.status(404).json({ error: "Image not found." });
    const imageUrl = rows[0].imageUrl || "";
    const mediaType = rows[0].mediaType === "video" ? "video" : "image";

    await prisma.$executeRaw`
      DELETE FROM "Gallery"
      WHERE "id" = ${id}
    `;

    if (imageUrl.includes("res.cloudinary.com") && imageUrl.includes("/upload/")) {
      try {
        const cleanUrl = imageUrl.split("?")[0];
        const uploadIndex = cleanUrl.indexOf("/upload/");
        const rawPath = cleanUrl.slice(uploadIndex + "/upload/".length);
        const segments = rawPath.split("/").filter(Boolean);
        if (segments[0] && (segments[0].includes(",") || segments[0].includes(":") || segments[0].startsWith("f_") || segments[0].startsWith("q_"))) {
          segments.shift();
        }
        if (segments[0] && /^v\d+$/.test(segments[0])) {
          segments.shift();
        }
        const publicId = segments.join("/").replace(/\.[^/.]+$/, "");
        if (publicId) {
          await cloudinary.uploader.destroy(publicId, { resource_type: mediaType });
        }
      } catch (cloudinaryError) {
        console.warn("Gallery image deleted from DB but Cloudinary cleanup failed.", cloudinaryError);
      }
    }

    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete gallery image.", details: error?.message || "Unknown error" });
  }
};

export const getBookingReminders = async (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({
    bookingId: id,
    whatsapp: `https://wa.me/91${TECHNICIAN_PHONE}?text=Reminder%20for%20booking%20${id}`,
    sms: `sms:+91${TECHNICIAN_PHONE}?body=Reminder for booking ${id}`,
  });
};

export const getTechnicianJobs = async (req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const phone = String(req.query.phone || "");
    const tech = await prisma.$queryRaw<Array<{ id: string; name: string; phone: string }>>`
      SELECT "id", "name", "phone" FROM "Technician"
      WHERE "phone" = ${phone || TECHNICIAN_PHONE}
      LIMIT 1
    `;
    if (!tech.length) return res.json([]);

    const jobs = await prisma.$queryRaw<Array<{ bookingId: string }>>`
      SELECT "bookingId" FROM "ServiceAssignment"
      WHERE "technicianId" = ${tech[0].id}
      ORDER BY "assignedAt" DESC
      LIMIT 30
    `;
    const bookingIds = jobs.map((j) => j.bookingId);
    if (!bookingIds.length) return res.json([]);
    const bookings = await prisma.serviceBooking.findMany({ where: { id: { in: bookingIds } }, orderBy: { scheduledAt: "asc" } });
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch technician jobs.", details: error?.message || "Unknown error" });
  }
};

export const updateTechnicianJobStatus = async (req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const bookingId = String(req.params.bookingId || "");
    const { status, note } = req.body as {
      status?: "PENDING" | "ASSIGNED" | "OUT_FOR_REPAIR" | "REPAIRING" | "FIXED" | "COMPLETED" | "IN_PROGRESS" | "CANCELLED";
      note?: string;
    };
    if (!status) return res.status(400).json({ error: "status is required." });
    const normalizedStatus = status === "IN_PROGRESS" ? "REPAIRING" : status === "CANCELLED" ? "COMPLETED" : status;
    if (!["PENDING", "ASSIGNED", "OUT_FOR_REPAIR", "REPAIRING", "FIXED", "COMPLETED"].includes(normalizedStatus)) {
      return res.status(400).json({ error: "Invalid status update." });
    }

    const booking = await prisma.serviceBooking.update({
      where: { id: bookingId },
      data: { status: normalizedStatus as any },
    });
    await prisma.$executeRaw`
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (${createUuid()}, ${bookingId}, ${normalizedStatus}, ${note || `Updated by technician to ${normalizedStatus}`})
    `;
    res.json({ booking });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update technician job status.", details: error?.message || "Unknown error" });
  }
};

export const createSellRequest = async (req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const { userId, applianceType, brandModel, conditionNote, expectedPrice, pincode, imageUrl } = req.body as {
      userId?: string;
      applianceType?: string;
      brandModel?: string;
      conditionNote?: string;
      expectedPrice?: number | string;
      pincode?: string;
      imageUrl?: string;
    };
    if (!userId || !applianceType || !brandModel || !conditionNote) {
      return res.status(400).json({ error: "userId, applianceType, brandModel, conditionNote are required." });
    }
    const id = createUuid();
    await prisma.$executeRaw`
      INSERT INTO "SellRequest" ("id", "userId", "applianceType", "brandModel", "conditionNote", "expectedPrice", "pincode", "imageUrl", "status")
      VALUES (${id}, ${userId}, ${applianceType}, ${brandModel}, ${conditionNote}, ${expectedPrice ? Number(expectedPrice) : null}, ${pincode || null}, ${imageUrl || null}, ${"REQUESTED"})
    `;
    res.status(201).json({ id, message: "Sell request submitted." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to submit sell request.", details: error?.message || "Unknown error" });
  }
};

export const getSellRequests = async (req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const userId = String(req.query.userId || "");
    const rows = userId
      ? await prisma.$queryRaw<Array<any>>`SELECT * FROM "SellRequest" WHERE "userId" = ${userId} ORDER BY "createdAt" DESC`
      : await prisma.$queryRaw<Array<any>>`SELECT * FROM "SellRequest" ORDER BY "createdAt" DESC`;
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch sell requests.", details: error?.message || "Unknown error" });
  }
};

export const sendSellOffer = async (req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const { id } = req.params;
    const { offerPrice, pickupSlot } = req.body as { offerPrice?: number | string; pickupSlot?: string };
    if (!offerPrice) return res.status(400).json({ error: "offerPrice is required." });
    const offerId = createUuid();
    await prisma.$executeRaw`
      INSERT INTO "SellOffer" ("id", "requestId", "offerPrice", "pickupSlot", "status")
      VALUES (${offerId}, ${id}, ${Number(offerPrice)}, ${pickupSlot ? new Date(pickupSlot) : null}, ${"PENDING"})
    `;
    await prisma.$executeRaw`UPDATE "SellRequest" SET "status" = ${"OFFER_SENT"} WHERE "id" = ${id}`;
    res.json({ offerId, message: "Offer sent to customer." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to send offer.", details: error?.message || "Unknown error" });
  }
};

export const respondSellOffer = async (req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const { id } = req.params;
    const { action } = req.body as { action?: "ACCEPT" | "REJECT" };
    if (!action || !["ACCEPT", "REJECT"].includes(action)) return res.status(400).json({ error: "action must be ACCEPT or REJECT." });

    const status = action === "ACCEPT" ? "ACCEPTED" : "REJECTED";
    await prisma.$executeRaw`UPDATE "SellOffer" SET "status" = ${status} WHERE "id" = ${id}`;
    const rel = await prisma.$queryRaw<Array<{ requestId: string }>>`SELECT "requestId" FROM "SellOffer" WHERE "id" = ${id} LIMIT 1`;
    if (rel[0]?.requestId) {
      await prisma.$executeRaw`UPDATE "SellRequest" SET "status" = ${status} WHERE "id" = ${rel[0].requestId}`;
    }
    res.json({ message: `Offer ${status.toLowerCase()}.` });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to respond offer.", details: error?.message || "Unknown error" });
  }
};

export const moveSellRequestToRefurbished = async (req: Request, res: Response) => {
  try {
    await ensurePhase1ProductSchema().catch(() => {});
    await ensurePhase2Schema().catch(() => {});
    const { id } = req.params;
    const { sellerId, title, description, price, imageUrl } = req.body as {
      sellerId?: string;
      title?: string;
      description?: string;
      price?: number | string;
      imageUrl?: string;
    };
    if (!sellerId || !title || !price) {
      return res.status(400).json({ error: "sellerId, title, and price are required." });
    }

    const product = await prisma.product.create({
      data: {
        title,
        description: description || "",
        price: Number(price),
        sellerId,
        isUsed: true,
        productType: "REFURBISHED",
        conditionScore: 8,
        ageMonths: 24,
        warrantyType: "SHOP",
        images: imageUrl ? [cloudinaryOptimizeUrl(imageUrl)] : [],
        status: "AVAILABLE",
      },
    });
    await prisma.$executeRaw`UPDATE "SellRequest" SET "status" = ${"REFURBISHED_LISTED"} WHERE "id" = ${id}`;
    res.json({ message: "Moved to refurbished inventory.", product });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to move to inventory.", details: error?.message || "Unknown error" });
  }
};

export const getOpsAnalytics = async (_req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const [totalReqRows, acceptedRows, topFaults, slaRows, products] = await Promise.all([
      prisma.$queryRaw<Array<{ count: bigint | number }>>`SELECT COUNT(*)::bigint AS count FROM "SellRequest"`,
      prisma.$queryRaw<Array<{ count: bigint | number }>>`SELECT COUNT(*)::bigint AS count FROM "SellRequest" WHERE "status" IN ('ACCEPTED','REFURBISHED_LISTED')`,
      prisma.$queryRaw<Array<{ appliance: string; count: bigint | number }>>`
        SELECT "appliance", COUNT(*)::bigint AS count FROM "ServiceBooking" GROUP BY "appliance" ORDER BY count DESC LIMIT 5
      `,
      prisma.$queryRaw<Array<{ hours: number }>>`
        SELECT EXTRACT(EPOCH FROM (MAX(e2."createdAt") - MIN(e1."createdAt")))/3600 AS hours
        FROM "ServiceEvent" e1
        JOIN "ServiceEvent" e2 ON e1."bookingId" = e2."bookingId"
        WHERE e1."status" = 'REQUEST_RECEIVED' AND e2."status" = 'COMPLETED'
        GROUP BY e1."bookingId"
      `,
      prisma.$queryRaw<Array<{ productType: string; price: number }>>`SELECT "productType", "price" FROM "Product"`,
    ]);
    const totalRequests = Number(totalReqRows?.[0]?.count || 0);
    const accepted = Number(acceptedRows?.[0]?.count || 0);
    const conversionRate = totalRequests ? Number(((accepted / totalRequests) * 100).toFixed(1)) : 0;
    const avgSlaHours = slaRows.length ? Number((slaRows.reduce((sum, r) => sum + Number(r.hours || 0), 0) / slaRows.length).toFixed(1)) : 0;
    const marginByCategory = products.reduce<Record<string, number>>((acc, p) => {
      const type = p.productType || "NEW";
      const marginPct = type === "REFURBISHED" ? 0.18 : 0.1;
      acc[type] = Number(((acc[type] || 0) + Number(p.price || 0) * marginPct).toFixed(2));
      return acc;
    }, {});

    res.json({
      conversionRate,
      avgSlaHours,
      topFaults: topFaults.map((r) => ({ appliance: r.appliance, count: Number(r.count || 0) })),
      marginByCategory,
      totalSellRequests: totalRequests,
      acceptedSellRequests: accepted,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch analytics.", details: error?.message || "Unknown error" });
  }
};

export const getAdminServiceOverview = async (_req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const [recentBookings, assignmentRows, technicians] = await Promise.all([
      prisma.$queryRaw<
        Array<{
          id: string;
          appliance: string;
          issue: string;
          status: string;
          scheduledAt: Date;
          finalCost: number | null;
          paymentQR: string | null;
          invoiceUrl: string | null;
          address: string | null;
          contactName: string | null;
          contactPhone: string | null;
          guestName: string | null;
          guestPhone: string | null;
          customerName: string | null;
          customerEmail: string | null;
        }>
      >`
        SELECT
          sb."id",
          sb."appliance",
          sb."issue",
          sb."status"::text AS "status",
          sb."scheduledAt",
          sb."finalCost",
          sb."paymentQR",
          sb."invoiceUrl",
          sb."address",
          sb."contactName",
          sb."contactPhone",
          sb."guestName",
          sb."guestPhone",
          u."name" AS "customerName",
          u."email" AS "customerEmail"
        FROM "ServiceBooking" sb
        LEFT JOIN "User" u ON u."id" = sb."customerId"
        ORDER BY sb."scheduledAt" DESC
        LIMIT 20
      `,
      prisma.$queryRaw<Array<{ bookingId: string; technicianId: string; pincode: string; routeNote: string }>>`
        SELECT "bookingId", "technicianId", COALESCE("pincode",'') AS "pincode", COALESCE("routeNote",'') AS "routeNote"
        FROM "ServiceAssignment"
      `,
      prisma.$queryRaw<Array<{ id: string; name: string; phone: string }>>`SELECT "id", "name", "phone" FROM "Technician"`,
    ]);

    const assignmentMap = new Map(assignmentRows.map((row) => [row.bookingId, row]));
    const techMap = new Map(technicians.map((t) => [t.id, t]));
    const pipelineCounts = recentBookings.reduce<Record<string, number>>((acc, booking) => {
      const key = booking.status || "PENDING";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    res.json({
      bookings: recentBookings.map((b) => {
        const assignment = assignmentMap.get(b.id);
        const tech = assignment ? techMap.get(assignment.technicianId) : null;
        const resolvedName = b.contactName || b.guestName || b.customerName || "Unknown";
        const resolvedPhone = b.contactPhone || b.guestPhone || null;
        return {
          ...b,
          customer: {
            name: resolvedName,
            email: b.customerEmail || "",
          },
          contactName: resolvedName,
          contactPhone: resolvedPhone,
          address: b.address || null,
          technician: tech || null,
          pincode: assignment?.pincode || null,
          routeNote: assignment?.routeNote || null,
        };
      }),
      pipelineCounts,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch admin service overview.", details: error?.message || "Unknown error" });
  }
};

export const generateDocument = async (req: Request, res: Response) => {
  try {
    await ensurePhase2Schema().catch(() => {});
    const { docType } = req.params as { docType: string };
    const { bookingId, amount, gst, signature, notes } = req.body as {
      bookingId?: string;
      amount?: number | string;
      gst?: number | string;
      signature?: string;
      notes?: string;
    };
    const allowed = ["invoice", "warranty-certificate", "service-report"];
    if (!allowed.includes(docType)) return res.status(400).json({ error: "Unsupported docType." });

    const now = new Date();
    const title =
      docType === "invoice"
        ? "Golden Refrigeration - Invoice"
        : docType === "warranty-certificate"
          ? "Golden Refrigeration - Warranty Certificate"
          : "Golden Refrigeration - Service Report";
    const lines = [
      `Date: ${now.toLocaleString("en-IN")}`,
      `Booking ID: ${bookingId || "N/A"}`,
      `Amount: ₹${Number(amount || 0).toLocaleString()}`,
      `GST: ${Number(gst || 0)}%`,
      `Technician Contact: ${TECHNICIAN_PHONE}`,
      `Signature: ${signature || "Digital Sign - Golden Refrigeration"}`,
      `Notes: ${notes || "Generated from service module"}`,
    ];
    const pdfBuffer = makeSimplePdfBuffer(title, lines);
    await prisma.$executeRaw`
      INSERT INTO "DocumentLog" ("id", "docType", "bookingId", "meta")
      VALUES (${createUuid()}, ${docType}, ${bookingId || null}, ${JSON.stringify({ amount, gst, signature, notes })})
    `;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${docType}-${bookingId || "doc"}.pdf"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to generate document.", details: error?.message || "Unknown error" });
  }
};

export const generateInvoiceByBooking = async (req: Request, res: Response) => {
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

export const getAllDiagnoses = async (_req: Request, res: Response) => {
  try {
    const allData = await prisma.serviceBooking.findMany({
      include: {
        customer: { select: { name: true, email: true } },
      },
      orderBy: { scheduledAt: "desc" },
    });
    res.json(allData);
  } catch {
    res.status(500).json({ error: "Failed to fetch diagnosis data." });
  }
};

export const getStatsBasic = async (_req: Request, res: Response) => {
  try {
    const [bookingsCountRows, usersCountRows, productsCountRows] = await Promise.all([
      prisma.$queryRaw<Array<{ count: bigint | number }>>`SELECT COUNT(*)::bigint AS count FROM "ServiceBooking"`,
      prisma.$queryRaw<Array<{ count: bigint | number }>>`SELECT COUNT(*)::bigint AS count FROM "User"`,
      prisma.$queryRaw<Array<{ count: bigint | number }>>`SELECT COUNT(*)::bigint AS count FROM "Product"`,
    ]);
    const totalBookings = Number(bookingsCountRows?.[0]?.count || 0);
    const totalUsers = Number(usersCountRows?.[0]?.count || 0);
    const totalProducts = Number(productsCountRows?.[0]?.count || 0);
    res.json({ totalBookings, totalUsers, totalProducts });
  } catch {
    res.status(500).json({ error: "Stats fetch failed" });
  }
};

export const getStats = async (_req: Request, res: Response) => {
  try {
    const [bookingsCountRows, usersCountRows, productsCountRows, latestUsers, latestProducts, applianceStats] = await Promise.all([
      prisma.$queryRaw<Array<{ count: bigint | number }>>`SELECT COUNT(*)::bigint AS count FROM "ServiceBooking"`.catch(() => []),
      prisma.$queryRaw<Array<{ count: bigint | number }>>`SELECT COUNT(*)::bigint AS count FROM "User"`.catch(() => []),
      prisma.$queryRaw<Array<{ count: bigint | number }>>`SELECT COUNT(*)::bigint AS count FROM "Product"`.catch(() => []),
      prisma
        .$queryRaw<Array<{ id: string; name: string; email: string }>>`
        SELECT "id", "name", "email"
        FROM "User"
        ORDER BY "createdAt" DESC NULLS LAST
        LIMIT 5
      `
        .catch(() => []),
      prisma
        .$queryRaw<Array<{ id: string; title: string; price: number; images: string[]; status: string; isUsed: boolean }>>`
        SELECT "id", "title", "price", "images", "status", "isUsed"
        FROM "Product"
        ORDER BY "id" DESC
      `
        .catch(() => []),
      prisma
        .$queryRaw<Array<{ appliance: string; count: bigint | number }>>`
        SELECT "appliance", COUNT(*)::bigint AS count
        FROM "ServiceBooking"
        GROUP BY "appliance"
      `
        .catch(() => []),
    ]);
    const totalBookings = Number(bookingsCountRows?.[0]?.count || 0);
    const totalUsers = Number(usersCountRows?.[0]?.count || 0);
    const totalProducts = Number(productsCountRows?.[0]?.count || 0);

    res.json({
      totalBookings,
      totalUsers,
      totalProducts,
      latestUsers,
      latestProducts: latestProducts.map((p) => ({
        ...p,
        productType: p.isUsed ? "REFURBISHED" : "NEW",
      })),
      applianceStats: applianceStats.map((row) => ({
        appliance: row.appliance,
        _count: { _all: Number(row.count || 0) },
      })),
    });
  } catch {
    res.status(500).json({ error: "Stats fetch failed" });
  }
};
