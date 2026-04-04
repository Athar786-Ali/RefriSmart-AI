import { createHmac, timingSafeEqual } from "node:crypto";
import { cloudinary } from "../config/cloudinary.js";
import { prisma } from "../config/prisma.js";
import { razorpay, razorpayKeyId, razorpayKeySecret } from "../config/razorpay.js";
import { SHOP_UPI_ID, TECHNICIAN_PHONE, cloudinaryOptimizeUrl, createUuid, ensurePhase1ProductSchema, ensurePhase2Schema, generateSuggestedSlots, inferMediaTypeFromUrl, makeSimplePdfBuffer, } from "../config/runtime.js";
const getBookingsWithAssignment = async (customerId) => {
    const bookings = await prisma.serviceBooking.findMany({
        where: { customerId },
        orderBy: { scheduledAt: "desc" },
    });
    const bookingIds = bookings.map((b) => b.id);
    if (!bookingIds.length)
        return [];
    // Fix #10: Filter assignments in the DB with a WHERE clause instead of loading all
    // rows and filtering in JavaScript — prevents O(N) memory usage at scale.
    const assignmentRows = await prisma.$queryRaw `
      SELECT "bookingId", "technicianId", COALESCE("pincode",'') AS "pincode", COALESCE("routeNote",'') AS "routeNote"
      FROM "ServiceAssignment"
      WHERE "bookingId" = ANY(${bookingIds}::uuid[])
    `;
    const assignments = assignmentRows;
    const technicians = await prisma.$queryRaw `
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
export const getHistory = async (req, res) => {
    try {
        const userId = String(req.params.userId || "");
        const requesterId = req.userId;
        if (requesterId) {
            const requester = await prisma.user.findUnique({ where: { id: requesterId } });
            if (!requester)
                return res.status(403).json({ error: "Forbidden." });
            if (requester.role !== "ADMIN" && requesterId !== userId) {
                return res.status(403).json({ error: "Forbidden." });
            }
        }
        const history = await prisma.serviceBooking.findMany({
            where: { customerId: userId },
            orderBy: { scheduledAt: "desc" },
        });
        res.json(history);
    }
    catch {
        res.status(500).json({ error: "Failed to fetch history." });
    }
};
export const getBookingSlots = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const pincode = String(req.query.pincode || "").trim();
        const dateParam = String(req.query.date || "").trim();
        const targetDate = dateParam ? new Date(dateParam) : undefined;
        const techRows = await prisma.$queryRaw `
      SELECT "id", "name", "pincode"
      FROM "Technician"
      WHERE "active" = TRUE
      ORDER BY "id" ASC
    `;
        const technicians = pincode
            ? techRows.filter((t) => t.pincode === pincode || t.pincode.slice(0, 3) === pincode.slice(0, 3))
            : techRows;
        const slots = generateSuggestedSlots(targetDate).map((slot) => ({
            ...slot,
            technician: technicians[0] ? { id: technicians[0].id, name: technicians[0].name } : null,
        }));
        res.json({
            slots,
            technicians: technicians.slice(0, 5).map((t) => ({ id: t.id, name: t.name })),
        });
    }
    catch {
        res.status(500).json({ error: "Failed to fetch slots." });
    }
};
export const createBooking = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { appliance, issue, aiDiagnosis, slot, pincode, fullName, phoneNumber, guestName, guestPhone, address, lat, lng } = req.body;
        // Issue #6 Fix: userId MUST come from the verified JWT for authenticated users.
        // Accepting it from the request body allows any caller to impersonate any account.
        // Guests (no JWT) continue to work via guestName/guestPhone as before.
        const userId = req.userId ?? null;
        const trimmedAppliance = String(appliance || "").trim();
        const trimmedIssue = String(issue || "").trim();
        const trimmedFullName = String(fullName || "").trim();
        const trimmedAddress = String(address || "").trim();
        const trimmedPincode = String(pincode || "").trim();
        if (!trimmedAppliance || !trimmedIssue) {
            return res.status(400).json({ error: "appliance and issue are required." });
        }
        if (!trimmedFullName) {
            return res.status(400).json({ error: "Full name is required." });
        }
        const cleanedPhone = String(phoneNumber || "").replace(/\D/g, "");
        if (!cleanedPhone || cleanedPhone.length !== 10) {
            return res.status(400).json({ error: "A valid 10-digit phone number is required." });
        }
        if (!trimmedAddress) {
            return res.status(400).json({ error: "Full address is required." });
        }
        if (!/^\d{6}$/.test(trimmedPincode)) {
            return res.status(400).json({ error: "Pincode must be a 6-digit number." });
        }
        const SERVICE_PIN_PREFIXES = ["813210"];
        if (!SERVICE_PIN_PREFIXES.some((prefix) => trimmedPincode.startsWith(prefix))) {
            return res.status(400).json({ error: "Sorry, your location is outside our current service area." });
        }
        const scheduledAt = slot ? new Date(slot) : new Date(Date.now() + 2 * 60 * 60 * 1000);
        if (Number.isNaN(scheduledAt.getTime())) {
            return res.status(400).json({ error: "Invalid slot selected." });
        }
        const techRows = await prisma.$queryRaw `
      SELECT "id", "name", "phone", "pincode"
      FROM "Technician"
      WHERE "active" = TRUE
      ORDER BY "id" ASC
    `;
        if (!techRows.length) {
            return res.status(503).json({ error: "No technicians are available right now. Please try again later." });
        }
        const matchingTechs = techRows.filter((t) => trimmedPincode && (t.pincode === trimmedPincode || t.pincode.slice(0, 3) === trimmedPincode.slice(0, 3)));
        if (!matchingTechs.length) {
            return res.status(400).json({ error: "No technician available for this area right now." });
        }
        const selectedTech = matchingTechs[0];
        let resolvedCustomerId = null;
        let resolvedName = trimmedFullName;
        let resolvedPhone = cleanedPhone;
        let resolvedGuestName = String(guestName || "").trim();
        let resolvedGuestPhone = String(guestPhone || "").replace(/\D/g, "");
        if (userId) {
            const existingUser = await prisma.user.findUnique({ where: { id: userId } });
            if (!existingUser)
                return res.status(404).json({ error: "User not found." });
            resolvedCustomerId = userId;
            resolvedName = resolvedName || existingUser.name || "Customer";
            resolvedPhone = resolvedPhone || "Not provided";
        }
        else {
            resolvedGuestName = resolvedGuestName || resolvedName;
            resolvedGuestPhone = resolvedGuestPhone || resolvedPhone;
            if (!resolvedGuestName || !resolvedGuestPhone) {
                return res.status(400).json({ error: "guestName and guestPhone are required." });
            }
            resolvedName = resolvedGuestName;
            resolvedPhone = resolvedGuestPhone;
        }
        const booking = await prisma.serviceBooking.create({
            data: {
                customerId: resolvedCustomerId,
                guestName: resolvedCustomerId ? null : resolvedName,
                guestPhone: resolvedCustomerId ? null : resolvedPhone,
                appliance: trimmedAppliance,
                issue: trimmedIssue,
                aiDiagnosis: aiDiagnosis || null,
                status: "PENDING",
                scheduledAt,
                contactName: resolvedName,
                contactPhone: resolvedPhone,
            },
        });
        await prisma.$executeRaw `
      INSERT INTO "ServiceAssignment" ("bookingId", "technicianId", "pincode", "routeNote")
      VALUES (${booking.id}, ${selectedTech.id}, ${trimmedPincode || selectedTech.pincode}, ${"Auto allocated by pincode and availability"})
      ON CONFLICT ("bookingId") DO UPDATE
      SET "technicianId" = EXCLUDED."technicianId",
          "pincode" = EXCLUDED."pincode",
          "routeNote" = EXCLUDED."routeNote"
    `;
        await prisma.$executeRaw `
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (${createUuid()}, ${booking.id}, ${"REQUEST_RECEIVED"}, ${"Request received from customer"})
    `;
        await prisma.$executeRaw `
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
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create booking.", details: error?.message || "Unknown error" });
    }
};
// Fix #19: bookService was an exact duplicate of createBooking (one used raw SQL, one used Prisma ORM;
// both produced identical outcomes). The legacy /service/book route now delegates to createBooking.
export const bookService = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { userId, appliance, issue, address, lat, lng, slot, pincode, fullName, phoneNumber, guestName, guestPhone } = req.body;
        const trimmedAppliance = String(appliance || "").trim();
        const trimmedIssue = String(issue || "").trim();
        const trimmedFullName = String(fullName || "").trim();
        const trimmedAddress = String(address || "").trim();
        const trimmedPincode = String(pincode || "").trim();
        if (!trimmedAppliance || !trimmedIssue) {
            return res.status(400).json({ error: "appliance and issue are required." });
        }
        if (!trimmedFullName) {
            return res.status(400).json({ error: "Full name is required." });
        }
        const cleanedPhone = String(phoneNumber || "").replace(/\D/g, "");
        if (!cleanedPhone || cleanedPhone.length !== 10) {
            return res.status(400).json({ error: "A valid 10-digit phone number is required." });
        }
        if (!trimmedAddress) {
            return res.status(400).json({ error: "Full address is required." });
        }
        if (!/^\d{6}$/.test(trimmedPincode)) {
            return res.status(400).json({ error: "Pincode must be a 6-digit number." });
        }
        const SERVICE_PIN_PREFIXES = ["813210"];
        if (!SERVICE_PIN_PREFIXES.some((prefix) => trimmedPincode.startsWith(prefix))) {
            return res.status(400).json({ error: "Sorry, your location is outside our current service area." });
        }
        const scheduledAt = slot ? new Date(slot) : new Date(Date.now() + 2 * 60 * 60 * 1000);
        if (Number.isNaN(scheduledAt.getTime())) {
            return res.status(400).json({ error: "Invalid slot selected." });
        }
        const techRows = await prisma.$queryRaw `
      SELECT "id", "name", "phone", "pincode"
      FROM "Technician"
      WHERE "active" = TRUE
      ORDER BY "id" ASC
    `;
        if (!techRows.length) {
            return res.status(503).json({ error: "No technicians are available right now. Please try again later." });
        }
        const matchingTechs = techRows.filter((t) => trimmedPincode && (t.pincode === trimmedPincode || t.pincode.slice(0, 3) === trimmedPincode.slice(0, 3)));
        if (!matchingTechs.length) {
            return res.status(400).json({ error: "No technician available for this area right now." });
        }
        const selectedTech = matchingTechs[0];
        let resolvedCustomerId = null;
        let resolvedName = trimmedFullName;
        let resolvedPhone = cleanedPhone;
        let resolvedGuestName = String(guestName || "").trim();
        let resolvedGuestPhone = String(guestPhone || "").replace(/\D/g, "");
        if (userId) {
            const existingUser = await prisma.user.findUnique({ where: { id: userId } });
            if (!existingUser)
                return res.status(404).json({ error: "User not found." });
            resolvedCustomerId = userId;
            resolvedName = resolvedName || existingUser.name || "Customer";
            resolvedPhone = resolvedPhone || "Not provided";
        }
        else {
            resolvedGuestName = resolvedGuestName || resolvedName;
            resolvedGuestPhone = resolvedGuestPhone || resolvedPhone;
            if (!resolvedGuestName || !resolvedGuestPhone) {
                return res.status(400).json({ error: "guestName and guestPhone are required." });
            }
            resolvedName = resolvedGuestName;
            resolvedPhone = resolvedGuestPhone;
        }
        const bookingId = createUuid();
        const inserted = await prisma.$queryRaw `
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
        ${trimmedAppliance},
        ${trimmedIssue},
        ${"PENDING"}::"Status",
        ${scheduledAt},
        ${trimmedAddress || null},
        ${resolvedName},
        ${resolvedPhone},
        ${lat !== undefined && lat !== null && String(lat) !== "" ? Number(lat) : null},
        ${lng !== undefined && lng !== null && String(lng) !== "" ? Number(lng) : null}
      )
      RETURNING *
    `;
        const booking = inserted[0];
        await prisma.$executeRaw `
      INSERT INTO "ServiceAssignment" ("bookingId", "technicianId", "pincode", "routeNote")
      VALUES (${booking.id}, ${selectedTech.id}, ${trimmedPincode || selectedTech.pincode}, ${"Auto allocated by pincode and availability"})
      ON CONFLICT ("bookingId") DO UPDATE
      SET "technicianId" = EXCLUDED."technicianId",
          "pincode" = EXCLUDED."pincode",
          "routeNote" = EXCLUDED."routeNote"
    `;
        await prisma.$executeRaw `
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
    }
    catch (error) {
        res.status(500).json({ error: "Failed to book service.", details: error?.message || "Unknown error" });
    }
};
export const updateBookingStatus = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const id = String(req.params.id || "");
        const { status } = req.body;
        if (!status ||
            !["PENDING", "ASSIGNED", "ESTIMATE_APPROVED", "OUT_FOR_REPAIR", "REPAIRING", "PAYMENT_PENDING", "FIXED", "COMPLETED", "CANCELLED"].includes(status)) {
            return res.status(400).json({ error: "Valid status is required." });
        }
        const existing = await prisma.serviceBooking.findUnique({ where: { id } });
        if (!existing)
            return res.status(404).json({ error: "Booking not found." });
        if (["FIXED", "PAYMENT_PENDING", "COMPLETED"].includes(status) && (!existing.finalCost || existing.finalCost <= 0)) {
            return res.status(400).json({ error: "Final cost must be set before requesting payment or completing the booking." });
        }
        const updated = await prisma.serviceBooking.update({
            where: { id },
            data: { status: status },
        });
        await prisma.$executeRaw `
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (${createUuid()}, ${id}, ${status}, ${`Status updated to ${status}`})
    `;
        res.json({ booking: updated });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update status.", details: error?.message || "Unknown error" });
    }
};
export const rescheduleBooking = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const id = String(req.params.id || "");
        const { slot } = req.body;
        if (!slot)
            return res.status(400).json({ error: "slot is required." });
        const nextDate = new Date(slot);
        if (Number.isNaN(nextDate.getTime())) {
            return res.status(400).json({ error: "Invalid slot selected." });
        }
        // Issue #13 Fix: Prevent setting a scheduled date in the past.
        if (nextDate.getTime() <= Date.now()) {
            return res.status(400).json({ error: "Scheduled date must be in the future." });
        }
        const updated = await prisma.serviceBooking.update({
            where: { id },
            data: { scheduledAt: nextDate },
        });
        await prisma.$executeRaw `
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (${createUuid()}, ${id}, ${"RESCHEDULED"}, ${`Rescheduled to ${nextDate.toISOString()}`})
    `;
        res.json({ booking: updated, message: "Booking rescheduled." });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to reschedule.", details: error?.message || "Unknown error" });
    }
};
export const cancelBooking = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const id = String(req.params.id || "");
        const updated = await prisma.serviceBooking.update({
            where: { id },
            data: { status: "CANCELLED" },
        });
        await prisma.$executeRaw `
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (${createUuid()}, ${id}, ${"CANCELLED"}, ${"Cancelled by user/admin"})
    `;
        res.json({ booking: updated, message: "Booking cancelled." });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to cancel booking.", details: error?.message || "Unknown error" });
    }
};
export const getBookingTimeline = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const bookingId = String(req.params.bookingId || "");
        if (!bookingId)
            return res.status(400).json({ error: "bookingId is required." });
        const requesterId = req.userId;
        if (!requesterId)
            return res.status(401).json({ error: "Unauthorized." });
        const requester = await prisma.user.findUnique({ where: { id: requesterId } });
        if (!requester)
            return res.status(403).json({ error: "Forbidden." });
        if (requester.role !== "ADMIN") {
            const booking = await prisma.serviceBooking.findUnique({ where: { id: bookingId } });
            if (!booking || booking.customerId !== requesterId) {
                return res.status(403).json({ error: "Forbidden." });
            }
        }
        const events = await prisma.$queryRaw `
      SELECT "status", COALESCE("note", '') AS "note", "createdAt"
      FROM "ServiceEvent"
      WHERE "bookingId" = ${bookingId}
      ORDER BY "createdAt" ASC
    `;
        res.json({ timeline: events });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch timeline.", details: error?.message || "Unknown error" });
    }
};
export const sendBookingOtp = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const id = String(req.params.id || "");
        const booking = await prisma.serviceBooking.findUnique({ where: { id } });
        if (!booking)
            return res.status(404).json({ error: "Booking not found." });
        if (!["FIXED", "PAYMENT_PENDING"].includes(String(booking.status))) {
            return res.status(400).json({ error: "OTP can be generated only after the repair is marked fixed." });
        }
        if (!booking.finalCost || booking.finalCost <= 0) {
            return res.status(400).json({ error: "Final cost must be set before generating the completion OTP." });
        }
        // Issue #14 Fix: Rate-limit OTP generation to 1 per 5 minutes per booking.
        // Without this, admins can generate unlimited OTPs in rapid succession.
        const recentOtp = await prisma.$queryRaw `
      SELECT "createdAt" FROM "ServiceOtp"
      WHERE "bookingId" = ${id}
      ORDER BY "createdAt" DESC
      LIMIT 1
    `;
        if (recentOtp.length) {
            const lastGenerated = new Date(recentOtp[0].createdAt).getTime();
            const cooldownMs = 5 * 60 * 1000; // 5 minutes
            const msSinceLast = Date.now() - lastGenerated;
            if (msSinceLast < cooldownMs) {
                const waitSec = Math.ceil((cooldownMs - msSinceLast) / 1000);
                return res.status(429).json({
                    error: `OTP was recently generated. Please wait ${waitSec} seconds before requesting a new one.`,
                });
            }
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await prisma.$executeRaw `
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
    }
    catch (error) {
        res.status(500).json({ error: "Failed to generate OTP.", details: error?.message || "Unknown error" });
    }
};
export const verifyBookingOtp = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const id = String(req.params.id || "");
        const { otp } = req.body;
        if (!otp)
            return res.status(400).json({ error: "otp is required." });
        const booking = await prisma.serviceBooking.findUnique({ where: { id } });
        if (!booking)
            return res.status(404).json({ error: "Booking not found." });
        if (["CANCELLED", "COMPLETED"].includes(String(booking.status))) {
            return res.status(400).json({ error: "Booking is already closed." });
        }
        // Fix #3: The duplicate status check (lines 552–554 in original) was 100% dead code —
        // if the first check passes, the second identical condition can never be true.
        // Kept only this single check with the clearer, more specific error message.
        if (!["FIXED", "PAYMENT_PENDING"].includes(String(booking.status))) {
            return res.status(400).json({ error: "OTP verification is allowed only after repair is fixed." });
        }
        if (!booking.finalCost || booking.finalCost <= 0) {
            return res.status(400).json({ error: "Final cost must be set before completing the booking." });
        }
        const rows = await prisma.$queryRaw `
      SELECT "id", "otp", "expiresAt", "verified"
      FROM "ServiceOtp"
      WHERE "bookingId" = ${id}
      ORDER BY "createdAt" DESC
      LIMIT 1
    `;
        const latest = rows[0];
        if (!latest)
            return res.status(404).json({ error: "OTP not found." });
        if (latest.verified)
            return res.status(400).json({ error: "OTP already used." });
        if (new Date(latest.expiresAt).getTime() < Date.now())
            return res.status(400).json({ error: "OTP expired." });
        if (String(latest.otp) !== String(otp))
            return res.status(400).json({ error: "Invalid OTP." });
        await prisma.$executeRaw `UPDATE "ServiceOtp" SET "verified" = TRUE WHERE "id" = ${latest.id}`;
        const updatedBooking = await prisma.serviceBooking.update({
            where: { id },
            data: { status: "COMPLETED" },
        });
        await prisma.$executeRaw `
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (${createUuid()}, ${id}, ${"COMPLETED"}, ${"OTP verified and service completed"})
    `;
        res.json({ message: "OTP verified. Service marked completed.", booking: updatedBooking });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to verify OTP.", details: error?.message || "Unknown error" });
    }
};
export const getMyBookingsByPath = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const userId = String(req.params.userId || "");
        const requesterId = req.userId;
        if (requesterId) {
            const requester = await prisma.user.findUnique({ where: { id: requesterId } });
            if (!requester)
                return res.status(403).json({ error: "Forbidden." });
            if (requester.role !== "ADMIN" && requesterId !== userId) {
                return res.status(403).json({ error: "Forbidden." });
            }
        }
        const bookings = await getBookingsWithAssignment(userId);
        const activeBookings = bookings.filter((booking) => !["COMPLETED", "CANCELLED"].includes(String(booking.status)));
        res.json(activeBookings);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch bookings.", details: error?.message || "Unknown error" });
    }
};
export const getMyBookingsByQuery = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const userId = String(req.query.userId || "").trim();
        if (!userId)
            return res.status(400).json({ error: "userId is required." });
        const requesterId = req.userId;
        if (requesterId) {
            const requester = await prisma.user.findUnique({ where: { id: requesterId } });
            if (!requester)
                return res.status(403).json({ error: "Forbidden." });
            if (requester.role !== "ADMIN" && requesterId !== userId) {
                return res.status(403).json({ error: "Forbidden." });
            }
        }
        const bookings = await getBookingsWithAssignment(userId);
        const activeBookings = bookings.filter((booking) => !["COMPLETED", "CANCELLED"].includes(String(booking.status)));
        res.json(activeBookings);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch bookings.", details: error?.message || "Unknown error" });
    }
};
export const getGuestBooking = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const bookingId = String(req.query.bookingId || "").trim();
        const phone = String(req.query.phone || "").replace(/\D/g, "");
        if (!bookingId || phone.length !== 10) {
            return res.status(400).json({ error: "bookingId and valid 10-digit phone are required." });
        }
        const booking = await prisma.serviceBooking.findUnique({ where: { id: bookingId } });
        if (!booking || !booking.guestPhone)
            return res.status(404).json({ error: "Booking not found." });
        if (booking.guestPhone.replace(/\D/g, "") !== phone) {
            return res.status(403).json({ error: "Forbidden." });
        }
        const assignmentRows = await prisma.$queryRaw `
      SELECT "bookingId", "technicianId", COALESCE("pincode",'') AS "pincode", COALESCE("routeNote",'') AS "routeNote"
      FROM "ServiceAssignment"
      WHERE "bookingId" = ${bookingId}
      LIMIT 1
    `;
        const assignment = assignmentRows[0];
        let technician = null;
        if (assignment?.technicianId) {
            const techRows = await prisma.$queryRaw `
        SELECT "id", "name", "phone"
        FROM "Technician"
        WHERE "id" = ${assignment.technicianId}
        LIMIT 1
      `;
            technician = techRows[0] || null;
        }
        res.json({
            booking: {
                ...booking,
                technician,
                pincode: assignment?.pincode || null,
                routeNote: assignment?.routeNote || null,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch booking.", details: error?.message || "Unknown error" });
    }
};
export const updateAdminService = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const id = String(req.params.id || "");
        const { status, finalCost } = req.body;
        if (!status ||
            !["PENDING", "ASSIGNED", "ESTIMATE_APPROVED", "OUT_FOR_REPAIR", "REPAIRING", "PAYMENT_PENDING", "FIXED", "COMPLETED", "CANCELLED"].includes(status)) {
            return res.status(400).json({ error: "Valid status is required." });
        }
        if (status === "COMPLETED") {
            return res.status(400).json({ error: "Complete the booking only after payment verification." });
        }
        const parsedCost = finalCost === undefined || finalCost === null || String(finalCost).trim() === "" ? null : Number(finalCost);
        if (parsedCost !== null && (!Number.isFinite(parsedCost) || parsedCost < 0)) {
            return res.status(400).json({ error: "finalCost must be a valid positive number." });
        }
        const booking = (await prisma.serviceBooking.findUnique({ where: { id } }));
        if (!booking)
            return res.status(404).json({ error: "Booking not found." });
        // Issue #9 Fix: Prevent modifications to already-closed bookings.
        if (String(booking.status) === "COMPLETED") {
            return res.status(400).json({ error: "Booking is already completed and cannot be modified." });
        }
        if (String(booking.status) === "CANCELLED" && status !== "CANCELLED") {
            return res.status(400).json({ error: "Cancelled bookings cannot be reopened." });
        }
        const hasFinalCost = parsedCost !== null && Number(parsedCost) > 0;
        // Fix #4: Previously ANY status update that included a finalCost was unconditionally
        // overridden to PAYMENT_PENDING, skipping REPAIRING, FIXED, and the OTP step.
        // Now we only auto-advance to PAYMENT_PENDING when the admin is explicitly
        // locking in the final estimate (i.e., targeting FIXED or PAYMENT_PENDING).
        const isLockingPayment = ["FIXED", "PAYMENT_PENDING"].includes(status);
        const effectiveStatus = status !== "CANCELLED" && hasFinalCost && isLockingPayment && String(booking.status) !== "COMPLETED"
            ? "PAYMENT_PENDING"
            : status;
        const isPaymentStatus = effectiveStatus === "PAYMENT_PENDING";
        const isCancelled = effectiveStatus === "CANCELLED";
        const amountToUse = isPaymentStatus ? Number(parsedCost ?? booking.finalCost ?? 0) : Number(booking.finalCost ?? 0);
        if (isPaymentStatus && (!amountToUse || amountToUse <= 0)) {
            return res.status(400).json({ error: "Final cost must be set before requesting payment." });
        }
        const paymentQR = isPaymentStatus && amountToUse > 0
            ? `upi://pay?pa=${SHOP_UPI_ID}&pn=MD%20ATHAR%20ALI&am=${amountToUse}&cu=INR`
            : isCancelled
                ? null
                : booking.paymentQR;
        const invoiceUrl = isPaymentStatus
            ? `${req.protocol}://${req.get("host")}/api/docs/invoice/${id}`
            : isCancelled
                ? null
                : booking.invoiceUrl;
        const updated = await prisma.$queryRaw `
      UPDATE "ServiceBooking"
      SET
        "status" = ${effectiveStatus}::"Status",
        "finalCost" = ${isCancelled ? null : isPaymentStatus ? amountToUse : parsedCost ?? booking.finalCost},
        "paymentQR" = ${paymentQR || null},
        "invoiceUrl" = ${invoiceUrl || null}
      WHERE "id" = ${id}
      RETURNING *
    `;
        await prisma.$executeRaw `
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (
        ${createUuid()},
        ${id},
        ${effectiveStatus},
        ${effectiveStatus === "CANCELLED"
            ? "Booking cancelled by admin"
            : isPaymentStatus
                ? `Final estimate locked at ₹${amountToUse}. Payment request generated.`
                : `Admin updated status to ${effectiveStatus}`}
      )
    `;
        res.json({
            booking: updated[0] || null,
            paymentQR: paymentQR || null,
            invoiceUrl: invoiceUrl || null,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update service booking.", details: error?.message || "Unknown error" });
    }
};
export const createServiceRazorpayOrder = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const bookingId = String(req.params.id || "");
        const requesterId = req.userId;
        if (!bookingId)
            return res.status(400).json({ error: "bookingId is required." });
        if (!requesterId)
            return res.status(401).json({ error: "Unauthorized." });
        if (!razorpayKeyId || !razorpayKeySecret) {
            return res.status(500).json({ error: "Razorpay keys are not configured." });
        }
        const requester = await prisma.user.findUnique({ where: { id: requesterId } });
        if (!requester)
            return res.status(403).json({ error: "Forbidden." });
        const booking = await prisma.serviceBooking.findUnique({ where: { id: bookingId } });
        if (!booking)
            return res.status(404).json({ error: "Booking not found." });
        if (requester.role !== "ADMIN" && booking.customerId !== requesterId) {
            return res.status(403).json({ error: "Forbidden." });
        }
        if (["CANCELLED", "COMPLETED"].includes(String(booking.status))) {
            return res.status(400).json({ error: "Booking is already closed." });
        }
        const finalCost = Number(booking.finalCost || 0);
        if (!Number.isFinite(finalCost) || finalCost <= 0) {
            return res.status(400).json({ error: "Final cost must be set before payment." });
        }
        const amount = Math.round(finalCost * 100);
        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ error: "Invalid payment amount." });
        }
        const razorpayOrder = await razorpay.orders.create({
            amount,
            currency: "INR",
            receipt: bookingId,
        });
        res.json({ razorpayOrder, keyId: razorpayKeyId });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create Razorpay order.", details: error?.message || "Unknown error" });
    }
};
export const verifyServiceRazorpayPayment = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const bookingId = String(req.params.id || "");
        const requesterId = req.userId;
        if (!bookingId)
            return res.status(400).json({ error: "bookingId is required." });
        if (!requesterId)
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
        const requester = await prisma.user.findUnique({ where: { id: requesterId } });
        if (!requester)
            return res.status(403).json({ error: "Forbidden." });
        const updated = await prisma.$transaction(async (tx) => {
            const booking = await tx.serviceBooking.findUnique({ where: { id: bookingId } });
            if (!booking)
                throw new Error("Booking not found.");
            if (requester.role !== "ADMIN" && booking.customerId !== requesterId) {
                throw new Error("Forbidden.");
            }
            if (!booking.finalCost || booking.finalCost <= 0) {
                throw new Error("Final cost must be set before payment.");
            }
            if (String(booking.status) === "CANCELLED") {
                throw new Error("Booking is already closed.");
            }
            if (!["FIXED", "PAYMENT_PENDING", "COMPLETED"].includes(String(booking.status))) {
                throw new Error("Payment is not yet available for this booking.");
            }
            if (String(booking.status) === "COMPLETED") {
                return booking;
            }
            const updatedBooking = await tx.serviceBooking.update({
                where: { id: bookingId },
                data: { status: "COMPLETED" },
            });
            await tx.$executeRaw `
        INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
        VALUES (${createUuid()}, ${bookingId}, ${"COMPLETED"}, ${"Payment verified via Razorpay"})
      `;
            return updatedBooking;
        });
        res.json({ booking: updated });
    }
    catch (error) {
        if (error?.message?.includes("Booking not found")) {
            return res.status(404).json({ error: "Booking not found." });
        }
        if (error?.message?.includes("Forbidden")) {
            return res.status(403).json({ error: "Forbidden." });
        }
        if (error?.message?.includes("Final cost")) {
            return res.status(400).json({ error: error.message });
        }
        if (error?.message?.includes("Payment is not yet available")) {
            return res.status(400).json({ error: error.message });
        }
        if (error?.message?.includes("Booking is already closed")) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: "Failed to verify payment.", details: error?.message || "Unknown error" });
    }
};
export const confirmManualPayment = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const bookingId = String(req.params.bookingId || "");
        const requesterId = req.userId;
        if (!bookingId)
            return res.status(400).json({ error: "bookingId is required." });
        if (!requesterId)
            return res.status(401).json({ error: "Unauthorized." });
        const requester = await prisma.user.findUnique({ where: { id: requesterId } });
        if (!requester)
            return res.status(403).json({ error: "Forbidden." });
        const updated = await prisma.$transaction(async (tx) => {
            const booking = await tx.serviceBooking.findUnique({ where: { id: bookingId } });
            if (!booking)
                throw new Error("Booking not found.");
            if (requester.role !== "ADMIN" && booking.customerId !== requesterId) {
                throw new Error("Forbidden.");
            }
            if (String(booking.status) === "CANCELLED") {
                throw new Error("Booking is already cancelled.");
            }
            if (!booking.finalCost || booking.finalCost <= 0) {
                throw new Error("Final cost must be set before confirming payment.");
            }
            if (String(booking.status) === "COMPLETED") {
                return booking;
            }
            const updatedBooking = await tx.serviceBooking.update({
                where: { id: bookingId },
                data: { status: "COMPLETED" },
            });
            await tx.$executeRaw `
        INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
        VALUES (${createUuid()}, ${bookingId}, ${"COMPLETED"}, ${"Manual payment confirmed by admin"})
      `;
            return updatedBooking;
        });
        res.json({ booking: updated, message: "Manual payment confirmed." });
    }
    catch (error) {
        if (error?.message?.includes("Booking not found")) {
            return res.status(404).json({ error: "Booking not found." });
        }
        if (error?.message?.includes("Forbidden")) {
            return res.status(403).json({ error: "Forbidden." });
        }
        if (error?.message?.includes("Final cost")) {
            return res.status(400).json({ error: error.message });
        }
        if (error?.message?.includes("cancelled")) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: "Failed to confirm manual payment.", details: error?.message || "Unknown error" });
    }
};
export const cancelServiceBooking = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const bookingId = String(req.params.bookingId || "");
        const requesterId = req.userId;
        if (!bookingId)
            return res.status(400).json({ error: "bookingId is required." });
        if (!requesterId)
            return res.status(401).json({ error: "Unauthorized." });
        const requester = await prisma.user.findUnique({ where: { id: requesterId } });
        if (!requester)
            return res.status(403).json({ error: "Forbidden." });
        const updated = await prisma.$transaction(async (tx) => {
            const booking = await tx.serviceBooking.findUnique({ where: { id: bookingId } });
            if (!booking)
                throw new Error("Booking not found.");
            if (requester.role !== "ADMIN" && booking.customerId !== requesterId) {
                throw new Error("Forbidden.");
            }
            if (String(booking.status) === "COMPLETED") {
                throw new Error("Cannot cancel a completed booking — service is already done and payment received.");
            }
            // Issue #15 Fix: Reject cancellation if payment was already processed.
            // This prevents double-refund scenarios and workflow confusion.
            if (String(booking.status) === "CANCELLED") {
                return booking;
            }
            const updatedBooking = await tx.serviceBooking.update({
                where: { id: bookingId },
                data: { status: "CANCELLED" },
            });
            await tx.$executeRaw `
        INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
        VALUES (${createUuid()}, ${bookingId}, ${"CANCELLED"}, ${"Booking cancelled manually by admin"})
      `;
            return updatedBooking;
        });
        res.json({ booking: updated, message: "Booking cancelled." });
    }
    catch (error) {
        if (error?.message?.includes("Booking not found")) {
            return res.status(404).json({ error: "Booking not found." });
        }
        if (error?.message?.includes("Forbidden")) {
            return res.status(403).json({ error: "Forbidden." });
        }
        if (error?.message?.includes("completed")) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: "Failed to cancel booking.", details: error?.message || "Unknown error" });
    }
};
export const saveServiceRating = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const id = String(req.params.id || "");
        const rating = Number(req.body?.rating);
        if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ error: "rating must be between 1 and 5." });
        }
        const booking = (await prisma.serviceBooking.findUnique({ where: { id } }));
        if (!booking)
            return res.status(404).json({ error: "Booking not found." });
        if (String(booking.status) !== "COMPLETED") {
            return res.status(400).json({ error: "Rating can be submitted only after service completion." });
        }
        // Fix #11: Prevent overwriting an existing rating.
        if (booking.rating !== null && booking.rating !== undefined) {
            return res.status(400).json({ error: "A rating has already been submitted for this booking." });
        }
        const updated = await prisma.$queryRaw `
      UPDATE "ServiceBooking"
      SET "rating" = ${Math.round(rating)}
      WHERE "id" = ${id}
      RETURNING *
    `;
        if (!updated.length)
            return res.status(404).json({ error: "Booking not found." });
        await prisma.$executeRaw `
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (${createUuid()}, ${id}, ${"COMPLETED"}, ${`Customer submitted rating ${Math.round(rating)}/5`})
    `;
        res.json({ booking: updated[0] });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to save rating.", details: error?.message || "Unknown error" });
    }
};
export const uploadGalleryItem = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { imageUrl, caption, fileData, mediaType } = req.body;
        let finalUrl = (imageUrl || "").trim();
        let resolvedMediaType = mediaType === "video" ? "video" : mediaType === "image" ? "image" : inferMediaTypeFromUrl(finalUrl);
        if (fileData?.startsWith("data:video/"))
            resolvedMediaType = "video";
        if (fileData?.startsWith("data:image/"))
            resolvedMediaType = "image";
        if (fileData && !fileData.startsWith("data:image/") && !fileData.startsWith("data:video/")) {
            return res.status(400).json({ error: "Invalid media payload." });
        }
        if (fileData) {
            const base64 = fileData.split(",")[1] || "";
            const padding = (base64.match(/=+$/) || [""])[0].length;
            const bytes = Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
            const MAX_BYTES = 5 * 1024 * 1024;
            if (bytes > MAX_BYTES) {
                return res.status(413).json({ error: "File too large. Max size is 5MB." });
            }
        }
        if (!finalUrl && fileData && (fileData.startsWith("data:image/") || fileData.startsWith("data:video/"))) {
            const uploaded = await cloudinary.uploader.upload(fileData, {
                folder: "refri-smart/gallery",
                resource_type: resolvedMediaType,
            });
            finalUrl = resolvedMediaType === "image" ? cloudinaryOptimizeUrl(uploaded.secure_url) : uploaded.secure_url;
        }
        if (!finalUrl)
            return res.status(400).json({ error: "imageUrl or media fileData is required." });
        const id = createUuid();
        const storedUrl = resolvedMediaType === "image" ? cloudinaryOptimizeUrl(finalUrl) : finalUrl;
        await prisma.$executeRaw `
      INSERT INTO "Gallery" ("id", "imageUrl", "mediaType", "caption")
      VALUES (${id}, ${storedUrl}, ${resolvedMediaType}, ${caption || null})
    `;
        res.status(201).json({ id, imageUrl: storedUrl, mediaType: resolvedMediaType, caption: caption || null });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to upload gallery item.", details: error?.message || "Unknown error" });
    }
};
export const getGallery = async (_req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const rows = await prisma.$queryRaw `
      SELECT "id", "imageUrl", "mediaType", "caption", "createdAt"
      FROM "Gallery"
      ORDER BY "createdAt" DESC
    `;
        res.json(rows.map((row) => ({
            ...row,
            mediaType: row.mediaType === "video" ? "video" : "image",
            imageUrl: row.mediaType === "video" ? row.imageUrl : cloudinaryOptimizeUrl(row.imageUrl),
        })));
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch gallery.", details: error?.message || "Unknown error" });
    }
};
export const deleteGalleryItem = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { id } = req.params;
        const rows = await prisma.$queryRaw `
      SELECT "id", "imageUrl", "mediaType"
      FROM "Gallery"
      WHERE "id" = ${id}
      LIMIT 1
    `;
        if (!rows.length)
            return res.status(404).json({ error: "Image not found." });
        const imageUrl = rows[0].imageUrl || "";
        const mediaType = rows[0].mediaType === "video" ? "video" : "image";
        await prisma.$executeRaw `
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
            }
            catch (cloudinaryError) {
                console.warn("Gallery image deleted from DB but Cloudinary cleanup failed.", cloudinaryError);
            }
        }
        res.json({ success: true, id });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete gallery image.", details: error?.message || "Unknown error" });
    }
};
export const getBookingReminders = async (req, res) => {
    const { id } = req.params;
    res.json({
        bookingId: id,
        whatsapp: `https://wa.me/91${TECHNICIAN_PHONE}?text=Reminder%20for%20booking%20${id}`,
        sms: `sms:+91${TECHNICIAN_PHONE}?body=Reminder for booking ${id}`,
    });
};
export const getTechnicianJobs = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const phone = String(req.query.phone || "");
        const tech = await prisma.$queryRaw `
      SELECT "id", "name", "phone" FROM "Technician"
      WHERE "phone" = ${phone || TECHNICIAN_PHONE}
      LIMIT 1
    `;
        if (!tech.length)
            return res.json([]);
        const jobs = await prisma.$queryRaw `
      SELECT "bookingId" FROM "ServiceAssignment"
      WHERE "technicianId" = ${tech[0].id}
      ORDER BY "assignedAt" DESC
      LIMIT 30
    `;
        const bookingIds = jobs.map((j) => j.bookingId);
        if (!bookingIds.length)
            return res.json([]);
        const bookings = await prisma.serviceBooking.findMany({ where: { id: { in: bookingIds } }, orderBy: { scheduledAt: "asc" } });
        res.json(bookings);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch technician jobs.", details: error?.message || "Unknown error" });
    }
};
export const updateTechnicianJobStatus = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const bookingId = String(req.params.bookingId || "");
        const { status, note } = req.body;
        if (!status)
            return res.status(400).json({ error: "status is required." });
        if (status === "CANCELLED") {
            return res.status(400).json({ error: "Cancelled bookings must be handled by admin approval." });
        }
        const normalizedStatus = status === "IN_PROGRESS" ? "REPAIRING" : status;
        if (!["PENDING", "ASSIGNED", "OUT_FOR_REPAIR", "REPAIRING", "FIXED", "COMPLETED"].includes(normalizedStatus)) {
            return res.status(400).json({ error: "Invalid status update." });
        }
        const existing = await prisma.serviceBooking.findUnique({ where: { id: bookingId } });
        if (!existing)
            return res.status(404).json({ error: "Booking not found." });
        // R3 Fix: Technicians must NOT be able to directly force COMPLETED status.
        // The COMPLETED state is reached only after the customer OTP is verified via
        // POST /booking/:id/verify-otp (adminController.verifyBookingOtp).
        // Allowing technicians to bypass this skips payment verification entirely.
        if (normalizedStatus === "COMPLETED") {
            return res.status(400).json({
                error: "Bookings must be completed through the customer OTP verification flow, not directly by the technician.",
            });
        }
        const booking = await prisma.serviceBooking.update({
            where: { id: bookingId },
            data: { status: normalizedStatus },
        });
        await prisma.$executeRaw `
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (${createUuid()}, ${bookingId}, ${normalizedStatus}, ${note || `Updated by technician to ${normalizedStatus}`})
    `;
        res.json({ booking });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update technician job status.", details: error?.message || "Unknown error" });
    }
};
export const createSellRequest = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { userId, applianceType, brandModel, conditionNote, expectedPrice, pincode, imageUrl } = req.body;
        if (!userId || !applianceType || !brandModel || !conditionNote) {
            return res.status(400).json({ error: "userId, applianceType, brandModel, conditionNote are required." });
        }
        // R4 Fix: Validate that the user exists before attempting the INSERT.
        // Without this, a bad userId causes a FK constraint 500 error instead of a clean 404.
        const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
        if (!userExists)
            return res.status(404).json({ error: "User not found." });
        const id = createUuid();
        await prisma.$executeRaw `
      INSERT INTO "SellRequest" ("id", "userId", "applianceType", "brandModel", "conditionNote", "expectedPrice", "pincode", "imageUrl", "status")
      VALUES (${id}, ${userId}, ${applianceType}, ${brandModel}, ${conditionNote}, ${expectedPrice ? Number(expectedPrice) : null}, ${pincode || null}, ${imageUrl || null}, ${"REQUESTED"})
    `;
        res.status(201).json({ id, message: "Sell request submitted." });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to submit sell request.", details: error?.message || "Unknown error" });
    }
};
export const getSellRequests = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const userId = String(req.query.userId || "");
        const rows = userId
            ? await prisma.$queryRaw `SELECT * FROM "SellRequest" WHERE "userId" = ${userId} ORDER BY "createdAt" DESC`
            : await prisma.$queryRaw `SELECT * FROM "SellRequest" ORDER BY "createdAt" DESC`;
        res.json(rows);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch sell requests.", details: error?.message || "Unknown error" });
    }
};
export const sendSellOffer = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { id } = req.params;
        const { offerPrice, pickupSlot } = req.body;
        if (!offerPrice)
            return res.status(400).json({ error: "offerPrice is required." });
        // R5 Fix: Validate that the sell request exists before inserting an offer.
        // Previously, a bad requestId would cause a FK constraint 500 instead of a clean 404.
        const sellRequest = await prisma.$queryRaw `
      SELECT "id", "status" FROM "SellRequest" WHERE "id" = ${id} LIMIT 1
    `;
        if (!sellRequest.length)
            return res.status(404).json({ error: "Sell request not found." });
        if (!["REQUESTED", "OFFER_SENT"].includes(sellRequest[0].status)) {
            return res.status(400).json({ error: `Cannot send an offer for a sell request with status '${sellRequest[0].status}'.` });
        }
        await prisma.$executeRaw `
      UPDATE "SellOffer" SET "status" = ${'REJECTED'}
      WHERE "requestId" = ${id} AND "status" = 'PENDING'
    `;
        const offerId = createUuid();
        await prisma.$executeRaw `
      INSERT INTO "SellOffer" ("id", "requestId", "offerPrice", "pickupSlot", "status")
      VALUES (${offerId}, ${id}, ${Number(offerPrice)}, ${pickupSlot ? new Date(pickupSlot) : null}, ${"PENDING"})
    `;
        await prisma.$executeRaw `UPDATE "SellRequest" SET "status" = ${"OFFER_SENT"} WHERE "id" = ${id}`;
        res.json({ offerId, message: "Offer sent to customer." });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to send offer.", details: error?.message || "Unknown error" });
    }
};
export const respondSellOffer = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { id } = req.params;
        const { action } = req.body;
        if (!action || !["ACCEPT", "REJECT"].includes(action))
            return res.status(400).json({ error: "action must be ACCEPT or REJECT." });
        // Fix #5: SellOffer uses SellOfferStatus (PENDING/ACCEPTED/REJECTED).
        // SellRequest uses SellRequestStatus (REQUESTED/OFFER_SENT/ACCEPTED/REJECTED/REFURBISHED_LISTED).
        // These are separate enums with different domain meanings.
        // When a customer REJECTS an offer, the SellRequest stays as OFFER_SENT so the admin
        // can renegotiate with a new offer, rather than being permanently REJECTED.
        const offerStatus = action === "ACCEPT" ? "ACCEPTED" : "REJECTED";
        const requestStatus = action === "ACCEPT" ? "ACCEPTED" : "OFFER_SENT";
        await prisma.$executeRaw `UPDATE "SellOffer" SET "status" = ${offerStatus} WHERE "id" = ${id}`;
        const rel = await prisma.$queryRaw `SELECT "requestId" FROM "SellOffer" WHERE "id" = ${id} LIMIT 1`;
        if (rel[0]?.requestId) {
            await prisma.$executeRaw `UPDATE "SellRequest" SET "status" = ${requestStatus} WHERE "id" = ${rel[0].requestId}`;
        }
        res.json({ message: `Offer ${offerStatus.toLowerCase()}.` });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to respond offer.", details: error?.message || "Unknown error" });
    }
};
export const moveSellRequestToRefurbished = async (req, res) => {
    try {
        await ensurePhase1ProductSchema().catch(() => { });
        await ensurePhase2Schema().catch(() => { });
        const { id } = req.params;
        const { sellerId, title, description, price, imageUrl } = req.body;
        if (!sellerId || !title || !price) {
            return res.status(400).json({ error: "sellerId, title, and price are required." });
        }
        // Fix #14: Validate that the SellRequest has been accepted before listing as refurbished.
        // Without this check, an admin could accidentally list a REQUESTED or REJECTED appliance.
        const requestRows = await prisma.$queryRaw `
      SELECT "status" FROM "SellRequest" WHERE "id" = ${id} LIMIT 1
    `;
        if (!requestRows.length)
            return res.status(404).json({ error: "Sell request not found." });
        if (requestRows[0].status !== "ACCEPTED") {
            return res.status(400).json({
                error: `Sell request must be ACCEPTED before listing as refurbished. Current status: ${requestRows[0].status}`,
            });
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
        await prisma.$executeRaw `UPDATE "SellRequest" SET "status" = ${"REFURBISHED_LISTED"} WHERE "id" = ${id}`;
        res.json({ message: "Moved to refurbished inventory.", product });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to move to inventory.", details: error?.message || "Unknown error" });
    }
};
export const getOpsAnalytics = async (_req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const [totalReqRows, acceptedRows, topFaults, slaRows, products] = await Promise.all([
            prisma.$queryRaw `SELECT COUNT(*)::bigint AS count FROM "SellRequest"`,
            prisma.$queryRaw `SELECT COUNT(*)::bigint AS count FROM "SellRequest" WHERE "status" IN ('ACCEPTED','REFURBISHED_LISTED')`,
            prisma.$queryRaw `
        SELECT "appliance", COUNT(*)::bigint AS count FROM "ServiceBooking" GROUP BY "appliance" ORDER BY count DESC LIMIT 5
      `,
            prisma.$queryRaw `
        SELECT EXTRACT(EPOCH FROM (MAX(e2."createdAt") - MIN(e1."createdAt")))/3600 AS hours
        FROM "ServiceEvent" e1
        JOIN "ServiceEvent" e2 ON e1."bookingId" = e2."bookingId"
        WHERE e1."status" = 'REQUEST_RECEIVED' AND e2."status" = 'COMPLETED'
        GROUP BY e1."bookingId"
      `,
            prisma.$queryRaw `SELECT "productType", "price" FROM "Product"`,
        ]);
        const totalRequests = Number(totalReqRows?.[0]?.count || 0);
        const accepted = Number(acceptedRows?.[0]?.count || 0);
        const conversionRate = totalRequests ? Number(((accepted / totalRequests) * 100).toFixed(1)) : 0;
        const avgSlaHours = slaRows.length ? Number((slaRows.reduce((sum, r) => sum + Number(r.hours || 0), 0) / slaRows.length).toFixed(1)) : 0;
        const marginByCategory = products.reduce((acc, p) => {
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
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch analytics.", details: error?.message || "Unknown error" });
    }
};
export const getAdminServiceOverview = async (_req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        // Issue #11 Fix: Fetch full system counts separately from the recent bookings list.
        // Previously, pipeline counts were inaccurate because they only counted the 20 results in the UI.
        const allCountsRows = await prisma.$queryRaw `
      SELECT "status", COUNT(*) as count
      FROM "ServiceBooking"
      GROUP BY "status"
    `;
        const [recentBookings, assignmentRows, technicians] = await Promise.all([
            prisma.$queryRaw `
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
        LIMIT 50
      `,
            prisma.$queryRaw `
        SELECT "bookingId", "technicianId", COALESCE("pincode",'') AS "pincode", COALESCE("routeNote",'') AS "routeNote"
        FROM "ServiceAssignment"
      `,
            prisma.$queryRaw `SELECT "id", "name", "phone" FROM "Technician"`,
        ]);
        const assignmentMap = new Map(assignmentRows.map((row) => [row.bookingId, row]));
        const techMap = new Map(technicians.map((t) => [t.id, t]));
        const pipelineCounts = allCountsRows.reduce((acc, row) => {
            const key = String(row.status) || "PENDING";
            acc[key] = (acc[key] || 0) + Number(row.count);
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
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch admin service overview.", details: error?.message || "Unknown error" });
    }
};
export const generateDocument = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { docType } = req.params;
        const { bookingId, amount, gst, signature, notes } = req.body;
        const allowed = ["invoice", "warranty-certificate", "service-report"];
        if (!allowed.includes(docType))
            return res.status(400).json({ error: "Unsupported docType." });
        const now = new Date();
        const title = docType === "invoice"
            ? "Golden Refrigeration - Invoice"
            : docType === "warranty-certificate"
                ? "Golden Refrigeration - Warranty Certificate"
                : "Golden Refrigeration - Service Report";
        const lines = [
            `Date: ${now.toLocaleString("en-IN")}`,
            `Booking ID: ${bookingId || "N/A"}`,
            `Amount: Rs. ${Number(amount || 0).toLocaleString("en-IN")}`,
            `GST: ${Number(gst || 0)}%`,
            `Technician Contact: ${TECHNICIAN_PHONE}`,
            `Signature: ${signature || "Digital Sign - Golden Refrigeration"}`,
            `Notes: ${notes || "Generated from service module"}`,
        ];
        const pdfBuffer = makeSimplePdfBuffer(title, lines);
        await prisma.$executeRaw `
      INSERT INTO "DocumentLog" ("id", "docType", "bookingId", "meta")
      VALUES (${createUuid()}, ${docType}, ${bookingId || null}, ${JSON.stringify({ amount, gst, signature, notes })})
    `;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${docType}-${bookingId || "doc"}.pdf"`);
        res.send(pdfBuffer);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to generate document.", details: error?.message || "Unknown error" });
    }
};
export const generateInvoiceByBooking = async (req, res) => {
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
export const getAllDiagnoses = async (_req, res) => {
    try {
        const allData = await prisma.serviceBooking.findMany({
            include: {
                customer: { select: { name: true, email: true } },
            },
            orderBy: { scheduledAt: "desc" },
        });
        res.json(allData);
    }
    catch {
        res.status(500).json({ error: "Failed to fetch diagnosis data." });
    }
};
export const getStatsBasic = async (_req, res) => {
    try {
        const [bookingsCountRows, usersCountRows, productsCountRows] = await Promise.all([
            prisma.$queryRaw `SELECT COUNT(*)::bigint AS count FROM "ServiceBooking"`,
            prisma.$queryRaw `SELECT COUNT(*)::bigint AS count FROM "User"`,
            prisma
                .$queryRaw `
          SELECT COUNT(*)::bigint AS count
          FROM "Product"
          WHERE COALESCE("isDeleted", false) = false
        `
                .catch(() => prisma.$queryRaw `SELECT COUNT(*)::bigint AS count FROM "Product"`),
        ]);
        const totalBookings = Number(bookingsCountRows?.[0]?.count || 0);
        const totalUsers = Number(usersCountRows?.[0]?.count || 0);
        const totalProducts = Number(productsCountRows?.[0]?.count || 0);
        res.json({ totalBookings, totalUsers, totalProducts });
    }
    catch {
        res.status(500).json({ error: "Stats fetch failed" });
    }
};
export const getStats = async (_req, res) => {
    try {
        const [bookingsCountRows, usersCountRows, productsCountRows, latestUsers, latestProducts, applianceStats] = await Promise.all([
            prisma.$queryRaw `SELECT COUNT(*)::bigint AS count FROM "ServiceBooking"`.catch(() => []),
            prisma.$queryRaw `SELECT COUNT(*)::bigint AS count FROM "User"`.catch(() => []),
            prisma
                .$queryRaw `
          SELECT COUNT(*)::bigint AS count
          FROM "Product"
          WHERE COALESCE("isDeleted", false) = false
        `
                .catch(async () => prisma.$queryRaw `SELECT COUNT(*)::bigint AS count FROM "Product"`),
            prisma
                .$queryRaw `
        SELECT "id", "name", "email"
        FROM "User"
        ORDER BY "createdAt" DESC NULLS LAST
        LIMIT 5
      `
                .catch(() => []),
            prisma
                .$queryRaw `
        SELECT "id", "title", "price", "images", "status", "isUsed", COALESCE("stockQty", 0) AS "stockQty"
        FROM "Product"
        WHERE COALESCE("isDeleted", false) = false
        ORDER BY "id" DESC
      `
                .catch(async () => {
                const fallback = await prisma.$queryRaw `
            SELECT "id", "title", "price", "images", "status", "isUsed"
            FROM "Product"
            ORDER BY "id" DESC
          `;
                return fallback.map((row) => ({ ...row, stockQty: null }));
            }),
            prisma
                .$queryRaw `
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
    }
    catch {
        res.status(500).json({ error: "Stats fetch failed" });
    }
};
