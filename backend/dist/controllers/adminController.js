import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "../config/prisma.js";
import { transporter } from "../utils/email.js";
import { razorpay, razorpayKeyId, razorpayKeySecret } from "../config/razorpay.js";
import { resolveUserIdFromRequest } from "../middlewares/authMiddleware.js";
import { SHOP_UPI_ID, TECHNICIAN_PHONE, cloudinaryOptimizeUrl, createUuid, ensurePhase1ProductSchema, ensurePhase2Schema, generateSuggestedSlots, inferMediaTypeFromUrl, makeSimplePdfBuffer, } from "../config/runtime.js";
import { listDiagnosisLogs } from "../services/diagnosisService.js";
import { removeStoredMedia, storeMediaFromDataUrl, storeMediaFromTempFile, toAbsoluteMediaUrl } from "../services/mediaStorageService.js";
import { getDisplayServiceStatusLabel, isAwaitingServicePayment, isClosedServiceStatus, toDisplayServiceStatus, toRawServiceStatus, } from "../utils/serviceStatus.js";
const getBookingsWithAssignment = async (customerId) => {
    const bookings = await prisma.serviceBooking.findMany({
        where: { customerId },
        orderBy: { scheduledAt: "desc" },
    });
    if (!bookings.length)
        return [];
    // Keep this path deliberately defensive. The customer tracker should never crash
    // because one assignment row or technician relation is missing/corrupt.
    return Promise.all(bookings.map(async (booking) => {
        try {
            const assignment = await getAssignmentSnapshot(booking.id);
            return applyAssignmentSnapshot(booking, assignment);
        }
        catch (error) {
            console.error("MY BOOKINGS ASSIGNMENT SNAPSHOT ERROR:", {
                bookingId: booking.id,
                error: error instanceof Error ? error.message : String(error),
            });
            return applyAssignmentSnapshot(booking, null);
        }
    }));
};
const serializeBookingWithAssignment = (booking, customer) => {
    const { assignment, ...bookingWithoutAssignment } = booking;
    const technician = booking.assignment?.technician
        ? {
            id: booking.assignment.technician.id,
            name: booking.assignment.technician.name,
            phone: booking.assignment.technician.phone,
        }
        : null;
    return {
        ...bookingWithoutAssignment,
        customer: customer
            ? {
                name: customer.name || "",
                email: customer.email || "",
            }
            : undefined,
        technician,
        technicianId: technician?.id || null,
        technicianName: technician?.name || null,
        pincode: assignment?.pincode || null,
        routeNote: assignment?.routeNote || null,
        displayStatus: toDisplayServiceStatus(String(booking.status)),
        statusLabel: getDisplayServiceStatusLabel(String(booking.status)),
    };
};
const getAssignmentSnapshot = async (bookingId) => {
    const rows = await prisma.$queryRaw `
    SELECT
      sa."bookingId",
      sa."technicianId",
      COALESCE(sa."pincode",'') AS "pincode",
      COALESCE(sa."routeNote",'') AS "routeNote",
      t."name" AS "technicianName",
      t."phone" AS "technicianPhone"
    FROM "ServiceAssignment" sa
    LEFT JOIN "Technician" t ON t."id" = sa."technicianId"
    WHERE sa."bookingId" = ${bookingId}
    LIMIT 1
  `;
    return rows[0] || null;
};
const applyAssignmentSnapshot = (booking, assignment, customer) => serializeBookingWithAssignment({
    ...booking,
    assignment: assignment
        ? {
            pincode: assignment.pincode || null,
            routeNote: assignment.routeNote || null,
            technician: assignment.technicianId && assignment.technicianName
                ? {
                    id: assignment.technicianId,
                    name: assignment.technicianName,
                    phone: assignment.technicianPhone || "",
                }
                : null,
        }
        : null,
}, customer);
const resolveBookingRequesterId = (req, requestedUserId) => {
    const tokenUserId = req.userId || resolveUserIdFromRequest(req);
    const normalizedRequestedUserId = String(requestedUserId || "").trim();
    if (normalizedRequestedUserId && !tokenUserId) {
        throw new Error("LOGIN_REQUIRED");
    }
    if (normalizedRequestedUserId && tokenUserId && normalizedRequestedUserId !== tokenUserId) {
        throw new Error("FORBIDDEN");
    }
    return tokenUserId || null;
};
const createServiceBookingRecord = async (req) => {
    await ensurePhase2Schema().catch(() => { });
    const { userId, appliance, issue, aiDiagnosis, slot, pincode, fullName, phoneNumber, guestName, guestPhone, address, lat, lng, } = req.body;
    const resolvedUserId = resolveBookingRequesterId(req, userId);
    const trimmedAppliance = String(appliance || "").trim();
    const trimmedIssue = String(issue || "").trim();
    const trimmedFullName = String(fullName || "").trim();
    const trimmedAddress = String(address || "").trim();
    const trimmedPincode = String(pincode || "").trim();
    const trimmedDiagnosis = String(aiDiagnosis || "").trim();
    if (!trimmedAppliance || !trimmedIssue) {
        throw new Error("VALIDATION:appliance and issue are required.");
    }
    if (!trimmedFullName) {
        throw new Error("VALIDATION:Full name is required.");
    }
    const cleanedPhone = String(phoneNumber || "").replace(/\D/g, "");
    if (!cleanedPhone || cleanedPhone.length !== 10) {
        throw new Error("VALIDATION:A valid 10-digit phone number is required.");
    }
    if (!trimmedAddress) {
        throw new Error("VALIDATION:Full address is required.");
    }
    if (!/^\d{6}$/.test(trimmedPincode)) {
        throw new Error("VALIDATION:Pincode must be a 6-digit number.");
    }
    const SERVICE_PIN_PREFIXES = ["812", "813", "853"];
    if (!SERVICE_PIN_PREFIXES.some((prefix) => trimmedPincode.startsWith(prefix))) {
        throw new Error("VALIDATION:Sorry, your location is outside our current service area.");
    }
    const scheduledAt = slot ? new Date(slot) : new Date(Date.now() + 2 * 60 * 60 * 1000);
    if (Number.isNaN(scheduledAt.getTime())) {
        throw new Error("VALIDATION:Invalid slot selected.");
    }
    const techRows = await prisma.$queryRaw `
    SELECT "id", "name", "phone", "pincode"
    FROM "Technician"
    WHERE "active" = TRUE
    ORDER BY "id" ASC
  `;
    if (!techRows.length) {
        throw new Error("NO_TECHNICIAN");
    }
    let matchingTechs = techRows.filter((tech) => trimmedPincode && (tech.pincode === trimmedPincode || tech.pincode.slice(0, 3) === trimmedPincode.slice(0, 3)));
    if (!matchingTechs.length) {
        matchingTechs = techRows;
    }
    const selectedTech = matchingTechs[0];
    let resolvedCustomerId = null;
    let resolvedName = trimmedFullName;
    let resolvedPhone = cleanedPhone;
    let resolvedGuestName = String(guestName || "").trim();
    let resolvedGuestPhone = String(guestPhone || "").replace(/\D/g, "");
    if (resolvedUserId) {
        const existingUser = await prisma.user.findUnique({ where: { id: resolvedUserId } });
        if (!existingUser) {
            throw new Error("USER_NOT_FOUND");
        }
        resolvedCustomerId = existingUser.id;
        resolvedName = trimmedFullName || existingUser.name || "Customer";
        resolvedPhone = cleanedPhone || String(existingUser.phone || "").replace(/\D/g, "") || "Not provided";
    }
    else {
        resolvedGuestName = resolvedGuestName || resolvedName;
        resolvedGuestPhone = resolvedGuestPhone || resolvedPhone;
        if (!resolvedGuestName || !resolvedGuestPhone) {
            throw new Error("VALIDATION:guestName and guestPhone are required.");
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
      "aiDiagnosis",
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
      ${trimmedDiagnosis || null},
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
    VALUES (${createUuid()}, ${booking.id}, ${"REQUEST_RECEIVED"}, ${"Request received from customer"})
  `;
    await prisma.$executeRaw `
    INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
    VALUES (${createUuid()}, ${booking.id}, ${"ASSIGNED"}, ${`Assigned to ${selectedTech.name}`})
  `;
    const responseBooking = serializeBookingWithAssignment({
        ...booking,
        assignment: {
            pincode: trimmedPincode || selectedTech.pincode,
            routeNote: "Auto allocated by pincode and availability",
            technician: selectedTech,
        },
    });
    return {
        booking: responseBooking,
        assignedTechnician: selectedTech,
        contact: {
            phone: selectedTech.phone || TECHNICIAN_PHONE,
            call: `tel:${selectedTech.phone || TECHNICIAN_PHONE}`,
            whatsapp: `https://wa.me/91${selectedTech.phone || TECHNICIAN_PHONE}`,
            sms: `sms:+91${selectedTech.phone || TECHNICIAN_PHONE}`,
        },
    };
};
const handleCreateBookingError = (res, error, fallbackMessage) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "LOGIN_REQUIRED") {
        return res.status(401).json({ error: "Session expired. Please log in again before booking." });
    }
    if (message === "FORBIDDEN") {
        return res.status(403).json({ error: "Forbidden." });
    }
    if (message === "USER_NOT_FOUND") {
        return res.status(404).json({ error: "User not found." });
    }
    if (message === "NO_TECHNICIAN") {
        return res.status(503).json({ error: "No technicians are available right now. Please try again later." });
    }
    if (message.startsWith("VALIDATION:")) {
        return res.status(400).json({ error: message.replace("VALIDATION:", "") });
    }
    return res.status(500).json({ error: fallbackMessage, details: message });
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
        let technicians = pincode
            ? techRows.filter((t) => t.pincode === pincode || t.pincode.slice(0, 3) === pincode.slice(0, 3))
            : techRows;
        if (!technicians.length) {
            technicians = techRows; // Fallback to any active technician to cover broader areas mapped to single district.
        }
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
        const result = await createServiceBookingRecord(req);
        res.status(201).json({
            ...result,
            message: "Technician booking created.",
        });
    }
    catch (error) {
        handleCreateBookingError(res, error, "Failed to create booking.");
    }
};
export const bookService = async (req, res) => {
    try {
        const result = await createServiceBookingRecord(req);
        res.status(201).json(result);
    }
    catch (error) {
        handleCreateBookingError(res, error, "Failed to book service.");
    }
};
export const updateBookingStatus = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const id = String(req.params.id || "");
        const normalizedStatus = toRawServiceStatus(String(req.body?.status || ""));
        if (!normalizedStatus) {
            return res.status(400).json({ error: "Valid status is required." });
        }
        const existing = await prisma.serviceBooking.findUnique({ where: { id } });
        if (!existing)
            return res.status(404).json({ error: "Booking not found." });
        const currentDisplayStatus = toDisplayServiceStatus(String(existing.status));
        const requestedDisplayStatus = toDisplayServiceStatus(normalizedStatus);
        if (requestedDisplayStatus === "COMPLETED") {
            return res.status(400).json({ error: "Bookings move to completed only after payment is confirmed." });
        }
        if (requestedDisplayStatus === "PAYMENT_PENDING") {
            if (!existing.finalCost || existing.finalCost <= 0) {
                return res.status(400).json({ error: "Final cost must be set before requesting payment." });
            }
            if (!["REPAIRING", "PAYMENT_PENDING"].includes(currentDisplayStatus)) {
                return res.status(400).json({ error: "Payment can be requested only after the repair is finished." });
            }
        }
        const effectiveStatus = requestedDisplayStatus === "PAYMENT_PENDING" ? "PAYMENT_PENDING" : normalizedStatus;
        const updated = await prisma.serviceBooking.update({
            where: { id },
            data: { status: effectiveStatus },
        });
        await prisma.$executeRaw `
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (${createUuid()}, ${id}, ${effectiveStatus}, ${`Status updated to ${effectiveStatus}`})
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
            data: { status: "PAYMENT_PENDING" },
        });
        await prisma.$executeRaw `
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (${createUuid()}, ${id}, ${"PAYMENT_PENDING"}, ${"OTP verified. Payment pending."})
    `;
        res.json({ message: "OTP verified. Payment is now pending.", booking: updatedBooking });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to verify OTP.", details: error?.message || "Unknown error" });
    }
};
export const getMyBookingsByPath = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        res.set("Cache-Control", "no-store, no-cache, must-revalidate");
        const userId = String(req.params.userId || "");
        const requesterId = req.userId;
        if (!requesterId)
            return res.status(401).json({ error: "Unauthorized." });
        const requester = await prisma.user.findUnique({ where: { id: requesterId } });
        if (!requester)
            return res.status(403).json({ error: "Forbidden." });
        if (requester.role !== "ADMIN" && requesterId !== userId) {
            return res.status(403).json({ error: "Forbidden." });
        }
        const bookings = await getBookingsWithAssignment(userId);
        const activeBookings = bookings.filter((booking) => !isClosedServiceStatus(String(booking.status)));
        const previousBookings = bookings.filter((booking) => isClosedServiceStatus(String(booking.status)));
        console.log("Bookings API response:", {
            userId,
            total: bookings.length,
            active: activeBookings.length,
            previous: previousBookings.length,
        });
        res.json({ bookings, activeBookings, previousBookings });
    }
    catch (error) {
        console.error("MY BOOKINGS ERROR:", error);
        res.status(500).json({ error: "Failed to fetch bookings.", details: error?.message || "Unknown error" });
    }
};
export const getMyBookingsByQuery = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        res.set("Cache-Control", "no-store, no-cache, must-revalidate");
        const requesterId = req.userId;
        if (!requesterId)
            return res.status(401).json({ error: "Unauthorized." });
        const requester = await prisma.user.findUnique({ where: { id: requesterId } });
        if (!requester)
            return res.status(403).json({ error: "Forbidden." });
        const requestedUserId = String(req.query.userId || "").trim();
        const userId = requester.role === "ADMIN" && requestedUserId ? requestedUserId : requesterId;
        if (requester.role !== "ADMIN" && requestedUserId && requestedUserId !== requesterId) {
            return res.status(403).json({ error: "Forbidden." });
        }
        const bookings = await getBookingsWithAssignment(userId);
        const activeBookings = bookings.filter((booking) => !isClosedServiceStatus(String(booking.status)));
        const previousBookings = bookings.filter((booking) => isClosedServiceStatus(String(booking.status)));
        console.log("Bookings API response:", {
            userId,
            total: bookings.length,
            active: activeBookings.length,
            previous: previousBookings.length,
        });
        res.json({ bookings, activeBookings, previousBookings });
    }
    catch (error) {
        console.error("MY BOOKINGS ERROR:", error);
        res.status(500).json({ error: "Failed to fetch bookings.", details: error?.message || "Unknown error" });
    }
};
export const getGuestBooking = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        res.set("Cache-Control", "no-store, no-cache, must-revalidate");
        const bookingId = String(req.query.bookingId || "").trim();
        const phone = String(req.query.phone || "").replace(/\D/g, "");
        if (!bookingId || phone.length !== 10) {
            return res.status(400).json({ error: "bookingId and valid 10-digit phone are required." });
        }
        const booking = await prisma.serviceBooking.findUnique({
            where: { id: bookingId },
        });
        if (!booking || !booking.guestPhone)
            return res.status(404).json({ error: "Booking not found." });
        if (booking.guestPhone.replace(/\D/g, "") !== phone) {
            return res.status(403).json({ error: "Forbidden." });
        }
        const assignment = await getAssignmentSnapshot(bookingId);
        res.json({
            booking: applyAssignmentSnapshot(booking, assignment),
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch booking.", details: error?.message || "Unknown error" });
    }
};
export const assignTechnician = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const bookingId = String(req.params.id || "").trim();
        const { technicianId, technicianName } = req.body;
        if (!bookingId) {
            return res.status(400).json({ error: "Booking id is required." });
        }
        if (!technicianId && !technicianName) {
            return res.status(400).json({ error: "technicianId or technicianName is required." });
        }
        const booking = await prisma.serviceBooking.findUnique({
            where: { id: bookingId },
            include: {
                customer: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                assignment: true,
            },
        });
        if (!booking) {
            return res.status(404).json({ error: "Booking not found." });
        }
        const technician = technicianId
            ? await prisma.technician.findFirst({
                where: { id: technicianId, active: true },
                select: { id: true, name: true, phone: true, email: true },
            })
            : await prisma.technician.findFirst({
                where: { name: technicianName?.trim(), active: true },
                select: { id: true, name: true, phone: true, email: true },
            });
        if (!technician) {
            return res.status(404).json({ error: "Technician not found." });
        }
        const updatedBooking = await prisma.$transaction(async (tx) => {
            await tx.serviceAssignment.upsert({
                where: { bookingId },
                create: {
                    bookingId,
                    technicianId: technician.id,
                    pincode: booking.assignment?.pincode || null,
                    routeNote: `Assigned by admin to ${technician.name}`,
                },
                update: {
                    technicianId: technician.id,
                    routeNote: `Assigned by admin to ${technician.name}`,
                },
            });
            const nextBooking = await tx.serviceBooking.update({
                where: { id: bookingId },
                data: { status: "ASSIGNED" },
                include: {
                    customer: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            });
            await tx.serviceEvent.create({
                data: {
                    id: createUuid(),
                    bookingId,
                    status: "ASSIGNED",
                    note: `Assigned technician ${technician.name}`,
                },
            });
            return nextBooking;
        });
        const assignment = await getAssignmentSnapshot(bookingId);
        if (technician.email) {
            try {
                await prisma.notification.create({
                    data: {
                        userEmail: technician.email,
                        message: "You have been assigned a new service request",
                        bookingId: booking.id
                    }
                });
                await transporter.sendMail({
                    to: technician.email,
                    subject: "New Service Assignment",
                    text: `
Hello ${technician.name},

You have been assigned a new service request.

Issue: ${booking.issue}
Address: ${booking.address || "No address provided"}

Please login to your dashboard.

- RefriSmart AI
          `
                });
                console.log(`Notification and email sent to ${technician.email}`);
            }
            catch (err) {
                console.error("Failed to send notification/email to technician", err);
            }
        }
        console.log("Assigned technician:", technician.name);
        console.log("Updated booking:", {
            bookingId: updatedBooking.id,
            status: updatedBooking.status,
            technicianId: technician.id,
        });
        res.json({
            booking: applyAssignmentSnapshot(updatedBooking, assignment, updatedBooking.customer),
            technician,
            message: "Technician assigned successfully.",
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to assign technician.", details: error?.message || "Unknown error" });
    }
};
export const updateAdminService = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const id = String(req.params.id || "");
        const normalizedStatus = toRawServiceStatus(String(req.body?.status || ""));
        const { finalCost } = req.body;
        if (!normalizedStatus) {
            return res.status(400).json({ error: "Valid status is required." });
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
        if (String(booking.status) === "CANCELLED" && normalizedStatus !== "CANCELLED") {
            return res.status(400).json({ error: "Cancelled bookings cannot be reopened." });
        }
        const currentDisplayStatus = toDisplayServiceStatus(String(booking.status));
        const requestedDisplayStatus = toDisplayServiceStatus(normalizedStatus);
        if (requestedDisplayStatus === "COMPLETED") {
            return res.status(400).json({ error: "Use payment confirmation to complete the booking." });
        }
        const isRequestingPayment = requestedDisplayStatus === "PAYMENT_PENDING";
        const effectiveStatus = isRequestingPayment ? "PAYMENT_PENDING" : normalizedStatus;
        const isPaymentStatus = effectiveStatus === "PAYMENT_PENDING";
        const isCancelled = effectiveStatus === "CANCELLED";
        const amountToUse = isPaymentStatus ? Number(parsedCost ?? booking.finalCost ?? 0) : Number(booking.finalCost ?? 0);
        if (isPaymentStatus && (!amountToUse || amountToUse <= 0)) {
            return res.status(400).json({ error: "Final cost must be set before requesting payment." });
        }
        if (isPaymentStatus && !["REPAIRING", "PAYMENT_PENDING"].includes(currentDisplayStatus)) {
            return res.status(400).json({ error: "Payment can be requested only after the repair is finished." });
        }
        const shouldClearPaymentArtifacts = !isPaymentStatus && currentDisplayStatus === "PAYMENT_PENDING";
        const paymentQR = isPaymentStatus && amountToUse > 0
            ? `upi://pay?pa=${SHOP_UPI_ID}&pn=MD%20ATHAR%20ALI&am=${amountToUse}&cu=INR`
            : isCancelled || shouldClearPaymentArtifacts
                ? null
                : booking.paymentQR;
        const invoiceUrl = isPaymentStatus
            ? `${req.protocol}://${req.get("host")}/api/docs/invoice/${id}`
            : isCancelled || shouldClearPaymentArtifacts
                ? null
                : booking.invoiceUrl;
        const updatedRows = await prisma.$queryRaw `
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
        const updatedBooking = await prisma.serviceBooking.findUnique({
            where: { id },
            include: {
                customer: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
        const assignment = await getAssignmentSnapshot(id);
        console.log("Updated booking:", {
            bookingId: id,
            requestedStatus: normalizedStatus,
            effectiveStatus,
            finalCost: isCancelled ? null : isPaymentStatus ? amountToUse : parsedCost ?? booking.finalCost,
        });
        res.json({
            booking: updatedBooking ? applyAssignmentSnapshot(updatedBooking, assignment, updatedBooking.customer) : updatedRows[0] || null,
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
        if (!isAwaitingServicePayment(String(booking.status))) {
            return res.status(400).json({ error: "Payment is not yet available for this booking." });
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
            if (!isAwaitingServicePayment(String(booking.status)) && String(booking.status) !== "COMPLETED") {
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
            if (!isAwaitingServicePayment(String(booking.status)) && String(booking.status) !== "COMPLETED") {
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
        if (error?.message?.includes("Payment is not yet available")) {
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
        const uploadedFile = req.file;
        let finalUrl = (imageUrl || "").trim();
        let resolvedMediaType = mediaType === "video" ? "video" : mediaType === "image" ? "image" : inferMediaTypeFromUrl(finalUrl);
        if (uploadedFile) {
            resolvedMediaType = uploadedFile.mimetype.startsWith("video/") ? "video" : "image";
            const stored = await storeMediaFromTempFile({
                filePath: uploadedFile.path,
                mimeType: uploadedFile.mimetype,
                originalName: uploadedFile.originalname,
                folder: "gallery",
                resourceType: resolvedMediaType,
            });
            finalUrl = stored.url;
            resolvedMediaType = stored.resourceType;
        }
        else if (fileData?.startsWith("data:video/")) {
            resolvedMediaType = "video";
        }
        else if (fileData?.startsWith("data:image/")) {
            resolvedMediaType = "image";
        }
        if (fileData && !fileData.startsWith("data:image/") && !fileData.startsWith("data:video/")) {
            return res.status(400).json({ error: "Invalid media payload." });
        }
        if (!finalUrl && fileData) {
            const stored = await storeMediaFromDataUrl({
                dataUrl: fileData,
                folder: "gallery",
                resourceType: resolvedMediaType,
            });
            finalUrl = stored.url;
            resolvedMediaType = stored.resourceType;
        }
        if (!finalUrl)
            return res.status(400).json({ error: "imageUrl, fileData, or multipart media is required." });
        const id = createUuid();
        const storedUrl = resolvedMediaType === "image" ? cloudinaryOptimizeUrl(finalUrl) : finalUrl;
        await prisma.$executeRaw `
      INSERT INTO "Gallery" ("id", "imageUrl", "mediaType", "caption")
      VALUES (${id}, ${storedUrl}, ${resolvedMediaType}, ${caption || null})
    `;
        res.status(201).json({
            id,
            imageUrl: toAbsoluteMediaUrl(req, storedUrl),
            mediaType: resolvedMediaType,
            caption: caption || null,
            createdAt: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to upload gallery item.", details: error?.message || "Unknown error" });
    }
};
export const getGallery = async (req, res) => {
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
            imageUrl: toAbsoluteMediaUrl(req, row.mediaType === "video" ? row.imageUrl : cloudinaryOptimizeUrl(row.imageUrl)),
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
        await prisma.$executeRaw `
      DELETE FROM "Gallery"
      WHERE "id" = ${id}
    `;
        await removeStoredMedia(imageUrl);
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
        const normalizedStatus = status === "IN_PROGRESS" ? "REPAIRING" : toRawServiceStatus(status);
        if (!normalizedStatus) {
            return res.status(400).json({ error: "Invalid status update." });
        }
        const requestedDisplayStatus = toDisplayServiceStatus(normalizedStatus);
        if (!["PENDING", "ASSIGNED", "ON_THE_WAY", "REPAIRING", "PAYMENT_PENDING", "COMPLETED"].includes(requestedDisplayStatus)) {
            return res.status(400).json({ error: "Invalid status update." });
        }
        const existing = await prisma.serviceBooking.findUnique({ where: { id: bookingId } });
        if (!existing)
            return res.status(404).json({ error: "Booking not found." });
        const currentDisplayStatus = toDisplayServiceStatus(String(existing.status));
        // Technicians can move work into the payment stage, but completion only happens
        // after payment is confirmed by the customer/admin payment flow.
        if (requestedDisplayStatus === "COMPLETED") {
            return res.status(400).json({
                error: "Bookings are completed only after payment is confirmed, not directly by the technician.",
            });
        }
        if (requestedDisplayStatus === "PAYMENT_PENDING") {
            if (!existing.finalCost || existing.finalCost <= 0) {
                return res.status(400).json({ error: "Final cost must be set before moving a booking to payment." });
            }
            if (!["REPAIRING", "PAYMENT_PENDING"].includes(currentDisplayStatus)) {
                return res.status(400).json({ error: "Payment can be requested only after the repair is finished." });
            }
        }
        const effectiveStatus = requestedDisplayStatus === "PAYMENT_PENDING" ? "PAYMENT_PENDING" : normalizedStatus;
        const booking = await prisma.serviceBooking.update({
            where: { id: bookingId },
            data: { status: effectiveStatus },
        });
        await prisma.$executeRaw `
      INSERT INTO "ServiceEvent" ("id", "bookingId", "status", "note")
      VALUES (${createUuid()}, ${bookingId}, ${effectiveStatus}, ${note || `Updated by technician to ${effectiveStatus}`})
    `;
        res.json({ booking });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update technician job status.", details: error?.message || "Unknown error" });
    }
};
const SELL_REQUEST_INCLUDE = {
    user: {
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
        },
    },
    offers: {
        orderBy: { createdAt: "desc" },
    },
};
const serializeSellOffer = (offer) => ({
    id: offer.id,
    offerPrice: Number(offer.offerPrice || 0),
    pickupSlot: offer.pickupSlot ? offer.pickupSlot.toISOString() : null,
    status: String(offer.status || "PENDING"),
    createdAt: offer.createdAt,
});
const serializeSellRequest = (req, sellRequest) => {
    const offers = Array.isArray(sellRequest.offers) ? sellRequest.offers.map(serializeSellOffer) : [];
    return {
        id: sellRequest.id,
        userId: sellRequest.userId,
        applianceType: sellRequest.applianceType,
        brandModel: sellRequest.brandModel,
        contactName: sellRequest.contactName || sellRequest.user?.name || null,
        address: sellRequest.address || null,
        conditionNote: sellRequest.conditionNote,
        expectedPrice: sellRequest.expectedPrice !== null && sellRequest.expectedPrice !== undefined ? Number(sellRequest.expectedPrice) : null,
        pincode: sellRequest.pincode || null,
        imageUrl: sellRequest.imageUrl ? toAbsoluteMediaUrl(req, cloudinaryOptimizeUrl(sellRequest.imageUrl)) : null,
        status: String(sellRequest.status || "REQUESTED"),
        createdAt: sellRequest.createdAt,
        customer: sellRequest.user
            ? {
                id: sellRequest.user.id,
                name: sellRequest.user.name || "",
                email: sellRequest.user.email || "",
                phone: sellRequest.user.phone || null,
            }
            : null,
        offers,
        latestOffer: offers[0] || null,
        pendingOffer: offers.find((offer) => offer.status === "PENDING") || null,
    };
};
const resolveSellRequestActor = async (req) => {
    const actorId = req.userId;
    if (!actorId)
        return null;
    return prisma.user.findUnique({
        where: { id: actorId },
        select: { id: true, role: true, name: true, email: true, phone: true },
    });
};
export const uploadSellRequestImage = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized." });
        const { fileData, fileName } = req.body;
        if (!fileData || typeof fileData !== "string" || !fileData.startsWith("data:image/")) {
            return res.status(400).json({ error: "Invalid image payload." });
        }
        const base64 = fileData.split(",")[1] || "";
        const padding = (base64.match(/=+$/) || [""])[0].length;
        const bytes = Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
        const MAX_BYTES = 10 * 1024 * 1024;
        if (bytes > MAX_BYTES) {
            return res.status(413).json({ error: "File too large. Max size is 10MB." });
        }
        const stored = await storeMediaFromDataUrl({
            dataUrl: fileData,
            originalName: fileName || "sell-request-image",
            folder: "sell",
            resourceType: "image",
        });
        res.status(201).json({
            imageUrl: toAbsoluteMediaUrl(req, cloudinaryOptimizeUrl(stored.url)),
            originalUrl: stored.url,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to upload sell request image.", details: error?.message || "Unknown error" });
    }
};
export const createSellRequest = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized." });
        const { applianceType, brandModel, contactName, address, conditionNote, expectedPrice, pincode, imageUrl, imageData } = req.body;
        if (!applianceType || !brandModel || !conditionNote) {
            return res.status(400).json({ error: "applianceType, brandModel, and conditionNote are required." });
        }
        const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true } });
        if (!userExists)
            return res.status(404).json({ error: "User not found." });
        const resolvedContactName = String(contactName || userExists.name || "").trim() || null;
        const resolvedAddress = String(address || "").trim() || null;
        const rawImageUrl = String(imageUrl || "").trim();
        const inlineImageData = [String(imageData || "").trim(), rawImageUrl].find((value) => value.startsWith("data:image/")) || "";
        let resolvedImageUrl = rawImageUrl || null;
        if (inlineImageData) {
            try {
                const stored = await storeMediaFromDataUrl({
                    dataUrl: inlineImageData,
                    originalName: "sell-request-image",
                    folder: "sell",
                    resourceType: "image",
                });
                resolvedImageUrl = stored.url;
            }
            catch {
                resolvedImageUrl = inlineImageData;
            }
        }
        const created = await prisma.sellRequest.create({
            data: {
                id: createUuid(),
                userId,
                applianceType: String(applianceType).trim(),
                brandModel: String(brandModel).trim(),
                contactName: resolvedContactName,
                address: resolvedAddress,
                conditionNote: String(conditionNote).trim(),
                expectedPrice: expectedPrice !== undefined && expectedPrice !== null && String(expectedPrice).trim() !== ""
                    ? Number(expectedPrice)
                    : null,
                pincode: String(pincode || "").trim() || null,
                imageUrl: resolvedImageUrl,
                status: "REQUESTED",
            },
            include: SELL_REQUEST_INCLUDE,
        });
        res.status(201).json({
            id: created.id,
            message: "Sell request submitted.",
            request: serializeSellRequest(req, created),
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to submit sell request.", details: error?.message || "Unknown error" });
    }
};
export const getSellRequests = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const actor = await resolveSellRequestActor(req);
        if (!actor)
            return res.status(401).json({ error: "Unauthorized." });
        const scope = String(req.query.scope || "").trim().toLowerCase();
        const requestedUserId = String(req.query.userId || "").trim();
        const where = scope === "mine"
            ? { userId: actor.id }
            : actor.role === "ADMIN"
                ? requestedUserId
                    ? { userId: requestedUserId }
                    : undefined
                : { userId: actor.id };
        const rows = await prisma.sellRequest.findMany({
            where,
            include: SELL_REQUEST_INCLUDE,
            orderBy: { createdAt: "desc" },
        });
        res.json(rows.map((row) => serializeSellRequest(req, row)));
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch sell requests.", details: error?.message || "Unknown error" });
    }
};
export const sendSellOffer = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ error: "Sell request id is required." });
        const { offerPrice, pickupSlot } = req.body;
        const parsedOfferPrice = Number(offerPrice);
        if (!Number.isFinite(parsedOfferPrice) || parsedOfferPrice <= 0) {
            return res.status(400).json({ error: "offerPrice must be a valid positive number." });
        }
        const parsedPickupSlot = pickupSlot ? new Date(pickupSlot) : null;
        if (parsedPickupSlot && Number.isNaN(parsedPickupSlot.getTime())) {
            return res.status(400).json({ error: "pickupSlot must be a valid date." });
        }
        const sellRequest = await prisma.sellRequest.findUnique({
            where: { id },
            select: { id: true, status: true },
        });
        if (!sellRequest)
            return res.status(404).json({ error: "Sell request not found." });
        if (!["REQUESTED", "OFFER_SENT", "REJECTED", "ACCEPTED"].includes(sellRequest.status)) {
            return res.status(400).json({ error: `Cannot send an offer for a sell request with status '${sellRequest.status}'.` });
        }
        const updatedRequest = await prisma.$transaction(async (tx) => {
            await tx.sellOffer.updateMany({
                where: { requestId: id, status: "PENDING" },
                data: { status: "REJECTED" },
            });
            await tx.sellOffer.create({
                data: {
                    id: createUuid(),
                    requestId: id,
                    offerPrice: parsedOfferPrice,
                    pickupSlot: parsedPickupSlot,
                    status: "PENDING",
                },
            });
            await tx.sellRequest.update({
                where: { id },
                data: { status: "OFFER_SENT" },
            });
            return tx.sellRequest.findUnique({
                where: { id },
                include: SELL_REQUEST_INCLUDE,
            });
        });
        if (!updatedRequest)
            return res.status(404).json({ error: "Sell request not found." });
        res.json({
            message: "Offer sent to customer.",
            request: serializeSellRequest(req, updatedRequest),
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to send offer.", details: error?.message || "Unknown error" });
    }
};
export const respondSellOffer = async (req, res) => {
    try {
        await ensurePhase2Schema().catch(() => { });
        const actor = await resolveSellRequestActor(req);
        if (!actor)
            return res.status(401).json({ error: "Unauthorized." });
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ error: "Offer id is required." });
        const { action } = req.body;
        if (!action || !["ACCEPT", "REJECT"].includes(action))
            return res.status(400).json({ error: "action must be ACCEPT or REJECT." });
        const offer = await prisma.sellOffer.findUnique({
            where: { id },
            select: {
                id: true,
                requestId: true,
                status: true,
            },
        });
        if (!offer)
            return res.status(404).json({ error: "Offer not found." });
        const requestOwner = await prisma.sellRequest.findUnique({
            where: { id: offer.requestId },
            select: { id: true, userId: true },
        });
        if (!requestOwner)
            return res.status(404).json({ error: "Sell request not found." });
        if (requestOwner.userId !== actor.id) {
            return res.status(403).json({ error: "Forbidden." });
        }
        if (offer.status !== "PENDING") {
            return res.status(400).json({ error: "This offer has already been responded to." });
        }
        const offerStatus = action === "ACCEPT" ? "ACCEPTED" : "REJECTED";
        const requestStatus = action === "ACCEPT" ? "ACCEPTED" : "REJECTED";
        const updatedRequest = await prisma.$transaction(async (tx) => {
            await tx.sellOffer.update({
                where: { id },
                data: { status: offerStatus },
            });
            await tx.sellRequest.update({
                where: { id: requestOwner.id },
                data: { status: requestStatus },
            });
            return tx.sellRequest.findUnique({
                where: { id: requestOwner.id },
                include: SELL_REQUEST_INCLUDE,
            });
        });
        if (!updatedRequest)
            return res.status(404).json({ error: "Sell request not found." });
        res.json({
            message: `Offer ${offerStatus.toLowerCase()}.`,
            request: serializeSellRequest(req, updatedRequest),
        });
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
        if (!id)
            return res.status(400).json({ error: "Sell request id is required." });
        const { sellerId, title, description, price, imageUrl } = req.body;
        const requestRow = await prisma.sellRequest.findUnique({
            where: { id },
            include: SELL_REQUEST_INCLUDE,
        });
        if (!requestRow)
            return res.status(404).json({ error: "Sell request not found." });
        if (requestRow.status !== "ACCEPTED") {
            return res.status(400).json({
                error: `Sell request must be ACCEPTED before listing as refurbished. Current status: ${requestRow.status}`,
            });
        }
        const offers = Array.isArray(requestRow.offers) ? requestRow.offers : [];
        // Use adminAuth userId as seller, fallback to the customer who submitted the request
        const derivedSellerId = String(sellerId || req.userId || requestRow.userId || "").trim();
        const derivedTitle = String(title || `${requestRow.applianceType} - ${requestRow.brandModel}` || requestRow.brandModel || requestRow.applianceType || "").trim();
        const derivedDescription = String(description ||
            `Refurbished appliance procured from customer.\nAppliance: ${requestRow.applianceType}\nBrand/Model: ${requestRow.brandModel}${requestRow.contactName ? `\nCustomer: ${requestRow.contactName}` : ""}${requestRow.address ? `\nPickup Address: ${requestRow.address}` : ""}\nCondition: ${requestRow.conditionNote}${requestRow.pincode ? `\nPincode: ${requestRow.pincode}` : ""}`).trim();
        // Find accepted offer price first, then any offer, then expected price
        const acceptedOffer = offers.find((o) => String(o.status) === "ACCEPTED");
        const anyOffer = offers[0] || null;
        const offerSourcePrice = acceptedOffer?.offerPrice ?? anyOffer?.offerPrice ?? null;
        const derivedPrice = price !== undefined && price !== null && String(price).trim() !== ""
            ? Number(price)
            : offerSourcePrice !== null && offerSourcePrice !== undefined
                ? Number(offerSourcePrice)
                : Number(requestRow.expectedPrice || 0);
        // Resolve image URL — strip Cloudinary transforms if present, store raw URL
        const rawImageUrl = String(imageUrl || requestRow.imageUrl || "").trim();
        // For products, store the plain URL without optimization transforms
        const productImageUrl = rawImageUrl ? rawImageUrl : "";
        if (!derivedSellerId) {
            return res.status(400).json({ error: "No seller found. Admin must be logged in." });
        }
        if (!derivedTitle) {
            return res.status(400).json({ error: "Unable to derive product title from appliance data." });
        }
        if (!Number.isFinite(derivedPrice) || derivedPrice <= 0) {
            return res.status(400).json({
                error: `Price could not be determined (got: ${derivedPrice}). Ensure the customer accepted an offer with a valid price, or provide a price.`,
                debug: { acceptedOffer, anyOffer, expectedPrice: requestRow.expectedPrice }
            });
        }
        const product = await prisma.product.create({
            data: {
                title: derivedTitle,
                description: derivedDescription,
                price: derivedPrice,
                sellerId: derivedSellerId,
                isUsed: true,
                productType: "REFURBISHED",
                conditionScore: 8,
                ageMonths: 24,
                warrantyType: "SHOP",
                images: productImageUrl ? [productImageUrl] : [],
                status: "AVAILABLE",
            },
        });
        const request = await prisma.sellRequest.update({
            where: { id },
            data: { status: "REFURBISHED_LISTED" },
            include: SELL_REQUEST_INCLUDE,
        });
        res.json({ message: "Moved to refurbished inventory.", product, request: serializeSellRequest(req, request) });
    }
    catch (error) {
        console.error("moveSellRequestToRefurbished error:", error?.message, error);
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
        res.set("Cache-Control", "no-store, no-cache, must-revalidate");
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
          u."email" AS "customerEmail",
          latest_event."latestEventAt" AS "latestEventAt"
        FROM "ServiceBooking" sb
        LEFT JOIN "User" u ON u."id" = sb."customerId"
        LEFT JOIN (
          SELECT "bookingId", MAX("createdAt") AS "latestEventAt"
          FROM "ServiceEvent"
          GROUP BY "bookingId"
        ) latest_event ON latest_event."bookingId" = sb."id"
        ORDER BY COALESCE(latest_event."latestEventAt", sb."scheduledAt") DESC, sb."scheduledAt" DESC
        LIMIT 200
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
                    latestEventAt: b.latestEventAt || b.scheduledAt,
                    technician: tech || null,
                    technicianId: tech?.id || null,
                    technicianName: tech?.name || null,
                    pincode: assignment?.pincode || null,
                    routeNote: assignment?.routeNote || null,
                    displayStatus: toDisplayServiceStatus(b.status),
                    statusLabel: getDisplayServiceStatusLabel(b.status),
                };
            }),
            pipelineCounts,
            technicians: technicians.map((technician) => ({
                id: technician.id,
                name: technician.name,
                phone: technician.phone,
            })),
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
        const requesterId = req.userId;
        if (!requesterId)
            return res.status(401).json({ error: "Unauthorized." });
        const requester = await prisma.user.findUnique({ where: { id: requesterId } });
        if (!requester)
            return res.status(403).json({ error: "Forbidden." });
        const booking = (await prisma.serviceBooking.findUnique({ where: { id: bookingId } }));
        if (!booking)
            return res.status(404).json({ error: "Booking not found." });
        if (requester.role !== "ADMIN" && booking.customerId !== requesterId) {
            return res.status(403).json({ error: "Forbidden." });
        }
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
export const getAllDiagnoses = async (req, res) => {
    try {
        const allData = await listDiagnosisLogs();
        res.json(allData.map((item) => ({
            id: item.id,
            appliance: item.appliance,
            issue: item.issue,
            aiDiagnosis: item.diagnosis,
            estimatedCostRange: item.estimatedCostRange,
            mediaUrl: item.mediaUrl ? toAbsoluteMediaUrl(req, item.mediaUrl) : null,
            mediaType: item.mediaType === "video" ? "video" : "image",
            createdAt: item.createdAt,
            customer: item.customerId
                ? {
                    id: item.customerId,
                    name: item.customerName || "Customer",
                    email: item.customerEmail || "",
                }
                : null,
            guestName: item.guestName,
            guestPhone: item.guestPhone,
        })));
    }
    catch (error) {
        res.status(500).json({ error: "Failed to load dashboard data.", details: error?.message || "Unknown error" });
    }
};
export const getTechnicianNotifications = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized." });
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.email)
            return res.status(404).json({ error: "User not found or no email." });
        const notifications = await prisma.notification.findMany({
            where: { userEmail: user.email },
            orderBy: { createdAt: "desc" }
        });
        res.json({ notifications });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch notifications.", details: error?.message || "Unknown error" });
    }
};
export const markNotificationAsRead = async (req, res) => {
    try {
        const id = String(req.params.id || "");
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized." });
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.email)
            return res.status(404).json({ error: "User not found or no email." });
        const notification = await prisma.notification.findUnique({ where: { id } });
        if (!notification)
            return res.status(404).json({ error: "Notification not found." });
        if (notification.userEmail !== user.email) {
            return res.status(403).json({ error: "Forbidden." });
        }
        const updated = await prisma.notification.update({
            where: { id },
            data: { read: true }
        });
        res.json({ notification: updated });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to mark notification as read.", details: error?.message || "Unknown error" });
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
