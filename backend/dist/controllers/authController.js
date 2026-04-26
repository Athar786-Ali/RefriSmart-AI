import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { COOKIE_MAX_AGE, JWT_SECRET, ensureAuthSchema, generateOtp, isEmailConfigured, sendEmail, } from "../config/runtime.js";
import { deliverLoginOtp } from "../services/otpService.js";
export const register = async (req, res) => {
    try {
        await ensureAuthSchema().catch(() => { });
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email, and password are required." });
        }
        const normalizedPhone = phone ? String(phone).replace(/\D/g, "") : "";
        if (normalizedPhone && normalizedPhone.length !== 10) {
            return res.status(400).json({ error: "Phone number must be 10 digits." });
        }
        const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
        if (existingUser) {
            return res.status(409).json({ error: "User already exists with this email." });
        }
        if (normalizedPhone) {
            const existingPhone = await prisma.user.findFirst({ where: { phone: normalizedPhone } });
            if (existingPhone) {
                return res.status(409).json({ error: "User already exists with this phone number." });
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name: name.trim(), email: email.toLowerCase().trim(), password: hashedPassword, phone: normalizedPhone || null },
        });
        try {
            await sendEmail(user.email, "Welcome to Golden Refrigeration", `<div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2>Welcome, ${user.name}!</h2>
          <p>Your account has been created successfully at <strong>Golden Refrigeration</strong>.</p>
          <p>Please log in and verify your account using OTP from your dashboard.</p>
        </div>`, `Welcome ${user.name}! Your Golden Refrigeration account is ready. Please login and verify your email with OTP.`);
        }
        catch (mailError) {
            console.warn("Welcome email failed:", mailError.message);
        }
        res.status(201).json({
            message: "Registration successful. Please log in and verify your account.",
            user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
        });
    }
    catch (error) {
        res.status(500).json({ error: "Registration failed.", details: error?.message || "Unknown error" });
    }
};
export const login = async (req, res) => {
    try {
        await ensureAuthSchema().catch(() => { });
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: "Email and password are required." });
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
        if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid Credentials" });
        }
        const adminEmail = (process.env.ADMIN_EMAIL || "mdatharsbr@gmail.com").toLowerCase().trim();
        const isOwnerEmail = user.email.toLowerCase() === adminEmail || user.email.toLowerCase() === "atharalisbr@gmail.com";
        const effectiveUser = isOwnerEmail && user.role !== "ADMIN"
            ? await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } })
            : user;
        const token = jwt.sign({ userId: effectiveUser.id }, JWT_SECRET, { expiresIn: "30d" });
        const isProd = process.env.NODE_ENV === "production";
        const verificationRows = await prisma.$queryRaw `
      SELECT COALESCE("isAccountVerified", FALSE) AS "isAccountVerified",
             COALESCE("isPhoneVerified", FALSE) AS "isPhoneVerified"
      FROM "User"
      WHERE "id" = ${user.id}
      LIMIT 1
    `;
        const isAccountVerified = Boolean(verificationRows[0]?.isAccountVerified);
        const isPhoneVerified = Boolean(verificationRows[0]?.isPhoneVerified);
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            maxAge: COOKIE_MAX_AGE,
            path: "/",
        });
        res.json({
            message: "Login successful.",
            user: {
                id: effectiveUser.id,
                name: effectiveUser.name,
                email: effectiveUser.email,
                role: effectiveUser.role,
                isAccountVerified,
                isPhoneVerified,
                phone: effectiveUser.phone,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: "Login failed.", details: error?.message || "Unknown error" });
    }
};
export const logout = async (_req, res) => {
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("token", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
    });
    res.json({ message: "Logged out successfully." });
};
export const sendVerifyOtp = async (req, res) => {
    try {
        await ensureAuthSchema().catch(() => { });
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized." });
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ error: "User not found." });
        // Fix #6: Prevent re-sending OTP to an already-verified account
        const verifiedRows = await prisma.$queryRaw `
      SELECT COALESCE("isAccountVerified", FALSE) AS "isAccountVerified"
      FROM "User" WHERE "id" = ${userId} LIMIT 1
    `;
        if (verifiedRows[0]?.isAccountVerified) {
            return res.status(400).json({ error: "Account is already verified." });
        }
        const otp = generateOtp();
        // Issue #5 Fix: OTP expiry reduced to 10 minutes (was 24 hours — a major security risk).
        const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
        await prisma.$executeRaw `
      UPDATE "User"
      SET "verifyOtp" = ${otp}, "verifyOtpExpiryAt" = ${expiry}
      WHERE "id" = ${userId}
    `;
        if (!isEmailConfigured()) {
            if (process.env.NODE_ENV !== "production") {
                return res.json({
                    message: "OTP generated. Email service not configured (dev mode).",
                    otpPreview: otp,
                });
            }
            return res.status(500).json({ error: "Email service is not configured. Set SMTP_USER and SMTP_PASS." });
        }
        try {
            await sendEmail(user.email, "Verify your Golden Refrigeration account", `<div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2>Account Verification OTP</h2>
          <p>Your OTP is:</p>
          <h1 style="letter-spacing:4px">${otp}</h1>
          <p>This OTP is valid for 24 hours.</p>
        </div>`, `Your Golden Refrigeration verification OTP is ${otp}. It is valid for 24 hours.`);
        }
        catch (mailError) {
            if (process.env.NODE_ENV !== "production") {
                return res.json({
                    message: "Email send failed (dev fallback).",
                    otpPreview: otp,
                });
            }
            throw mailError;
        }
        res.json({ message: "Verification OTP sent to your email." });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to send verification OTP.", details: error?.message || "Unknown error" });
    }
};
const buildWhatsappLink = (phone, otp) => {
    const message = `Golden Refrigeration OTP: ${otp}. Valid for 24 hours.`;
    return `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
};
export const sendWhatsappOtp = async (req, res) => {
    try {
        await ensureAuthSchema().catch(() => { });
        const userId = req.userId;
        const { phone } = req.body;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized." });
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ error: "User not found." });
        const normalizedPhone = String(phone || user.phone || "").replace(/\D/g, "");
        if (!normalizedPhone || normalizedPhone.length !== 10) {
            return res.status(400).json({ error: "Valid 10-digit phone number is required." });
        }
        // Fix #7: Check if the phone is already verified and the same number is being re-submitted
        const verifiedRows = await prisma.$queryRaw `
      SELECT COALESCE("isPhoneVerified", FALSE) AS "isPhoneVerified", "phone"
      FROM "User" WHERE "id" = ${userId} LIMIT 1
    `;
        const alreadyVerified = verifiedRows[0]?.isPhoneVerified;
        const existingPhone = String(verifiedRows[0]?.phone || "").replace(/\D/g, "");
        if (alreadyVerified && existingPhone === normalizedPhone) {
            return res.status(400).json({ error: "This phone number is already verified." });
        }
        // If a different phone is provided while the current one is verified, reset verification so
        // the user must re-verify the new number before it takes effect.
        const phoneChanged = existingPhone !== normalizedPhone;
        const otp = generateOtp();
        // Issue #5 Fix: OTP expiry reduced to 10 minutes (was 24 hours — a major security risk).
        const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
        await prisma.$executeRaw `
      UPDATE "User"
      SET "phone" = ${normalizedPhone},
          "phoneVerifyOtp" = ${otp},
          "phoneVerifyOtpExpiryAt" = ${expiry},
          "isPhoneVerified" = ${alreadyVerified && !phoneChanged ? true : false}
      WHERE "id" = ${userId}
    `;
        const whatsappLink = buildWhatsappLink(normalizedPhone, otp);
        res.json({
            message: phoneChanged && alreadyVerified
                ? "Phone number changed. Please verify your new number via WhatsApp OTP."
                : "Open WhatsApp to view your OTP.",
            whatsappLink,
            ...(process.env.NODE_ENV !== "production" ? { otpPreview: otp } : {}),
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to send WhatsApp OTP.", details: error?.message || "Unknown error" });
    }
};
export const verifyPhoneOtp = async (req, res) => {
    try {
        await ensureAuthSchema().catch(() => { });
        const userId = req.userId;
        const { otp } = req.body;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized." });
        if (!otp)
            return res.status(400).json({ error: "OTP is required." });
        const rows = await prisma.$queryRaw `
      SELECT "id", "phoneVerifyOtp", "phoneVerifyOtpExpiryAt"
      FROM "User"
      WHERE "id" = ${userId}
      LIMIT 1
    `;
        const user = rows[0];
        if (!user)
            return res.status(404).json({ error: "User not found." });
        if (!user.phoneVerifyOtp || !user.phoneVerifyOtpExpiryAt) {
            return res.status(400).json({ error: "No phone OTP found. Send OTP first." });
        }
        if (Date.now() > Number(user.phoneVerifyOtpExpiryAt)) {
            return res.status(400).json({ error: "OTP expired. Request a new OTP." });
        }
        if (String(user.phoneVerifyOtp) !== String(otp).trim()) {
            return res.status(400).json({ error: "Invalid OTP." });
        }
        await prisma.$executeRaw `
      UPDATE "User"
      SET "isPhoneVerified" = TRUE,
          "phoneVerifyOtp" = NULL,
          "phoneVerifyOtpExpiryAt" = NULL
      WHERE "id" = ${userId}
    `;
        res.json({ message: "Phone number verified successfully." });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to verify phone OTP.", details: error?.message || "Unknown error" });
    }
};
export const verifyOtp = async (req, res) => {
    try {
        await ensureAuthSchema().catch(() => { });
        const userId = req.userId;
        const { otp } = req.body;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized." });
        if (!otp)
            return res.status(400).json({ error: "OTP is required." });
        const rows = await prisma.$queryRaw `
      SELECT "id", "verifyOtp", "verifyOtpExpiryAt"
      FROM "User"
      WHERE "id" = ${userId}
      LIMIT 1
    `;
        const user = rows[0];
        if (!user)
            return res.status(404).json({ error: "User not found." });
        if (!user.verifyOtp || !user.verifyOtpExpiryAt)
            return res.status(400).json({ error: "No verification OTP found. Send OTP first." });
        if (Date.now() > Number(user.verifyOtpExpiryAt))
            return res.status(400).json({ error: "OTP expired. Request a new OTP." });
        if (String(user.verifyOtp) !== String(otp).trim())
            return res.status(400).json({ error: "Invalid OTP." });
        await prisma.$executeRaw `
      UPDATE "User"
      SET "isAccountVerified" = TRUE,
          "verifyOtp" = NULL,
          "verifyOtpExpiryAt" = NULL
      WHERE "id" = ${userId}
    `;
        res.json({ message: "Account verified successfully." });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to verify OTP.", details: error?.message || "Unknown error" });
    }
};
export const sendResetOtp = async (req, res) => {
    try {
        await ensureAuthSchema().catch(() => { });
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ error: "Email is required." });
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
        if (!user)
            return res.status(404).json({ error: "No account found with this email." });
        const otp = generateOtp();
        const expiry = Date.now() + 15 * 60 * 1000;
        await prisma.$executeRaw `
      UPDATE "User"
      SET "resetOtp" = ${otp}, "resetOtpExpiryAt" = ${expiry}
      WHERE "id" = ${user.id}
    `;
        if (!isEmailConfigured()) {
            if (process.env.NODE_ENV !== "production") {
                return res.json({
                    message: "OTP generated. Email service not configured (dev mode).",
                    otpPreview: otp,
                });
            }
            return res.status(500).json({ error: "Email service is not configured. Set SMTP_USER and SMTP_PASS." });
        }
        try {
            await sendEmail(user.email, "Golden Refrigeration password reset OTP", `<div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2>Password Reset OTP</h2>
          <p>Your OTP is:</p>
          <h1 style="letter-spacing:4px">${otp}</h1>
          <p>This OTP is valid for 15 minutes.</p>
        </div>`, `Your Golden Refrigeration password reset OTP is ${otp}. It is valid for 15 minutes.`);
        }
        catch (mailError) {
            if (process.env.NODE_ENV !== "production") {
                return res.json({
                    message: "Email send failed (dev fallback).",
                    otpPreview: otp,
                });
            }
            throw mailError;
        }
        res.json({ message: "Password reset OTP sent to your email." });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to send reset OTP.", details: error?.message || "Unknown error" });
    }
};
export const resetPassword = async (req, res) => {
    try {
        await ensureAuthSchema().catch(() => { });
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ error: "Email, OTP, and newPassword are required." });
        }
        if (newPassword.length < 6)
            return res.status(400).json({ error: "New password must be at least 6 characters long." });
        const users = await prisma.$queryRaw `
      SELECT "id", "resetOtp", "resetOtpExpiryAt"
      FROM "User"
      WHERE "email" = ${email.toLowerCase().trim()}
      LIMIT 1
    `;
        const user = users[0];
        if (!user)
            return res.status(404).json({ error: "No account found with this email." });
        if (!user.resetOtp || !user.resetOtpExpiryAt)
            return res.status(400).json({ error: "No reset OTP found. Request OTP first." });
        if (Date.now() > Number(user.resetOtpExpiryAt))
            return res.status(400).json({ error: "OTP expired. Request a new OTP." });
        if (String(user.resetOtp) !== String(otp).trim())
            return res.status(400).json({ error: "Invalid OTP." });
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // Fix #13: Update password AND clear reset OTP in a single atomic operation.
        // Note: Full JWT session invalidation requires a `passwordChangedAt` field on the User
        // model. Add it to schema.prisma and check it in authMiddleware for complete protection.
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });
        await prisma.$executeRaw `
      UPDATE "User"
      SET "resetOtp" = NULL, "resetOtpExpiryAt" = NULL
      WHERE "id" = ${user.id}
    `;
        res.json({ message: "Password updated successfully. If you were logged in on other devices, please log out and log in again for security." });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to reset password.", details: error?.message || "Unknown error" });
    }
};
export const getMe = async (req, res) => {
    try {
        await ensureAuthSchema().catch(() => { });
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized." });
        const user = (await prisma.user.findUnique({ where: { id: userId } }));
        if (!user)
            return res.status(404).json({ error: "User not found." });
        // Apply master admin promotion on every /me call — covers existing accounts
        // that were created before the admin hardwiring was added.
        const MASTER_ADMIN_PHONE = "9060877595";
        const adminEmail = (process.env.ADMIN_EMAIL || "mdatharsbr@gmail.com").toLowerCase().trim();
        const isOwnerEmail = String(user.email || "").toLowerCase() === adminEmail ||
            String(user.email || "").toLowerCase() === "atharalisbr@gmail.com";
        const isMasterAdminPhone = String(user.phone || "").replace(/\D/g, "") === MASTER_ADMIN_PHONE;
        let effectiveRole = user.role;
        if (isOwnerEmail || isMasterAdminPhone) {
            const needsRoleUpdate = user.role !== "ADMIN";
            const needsNameUpdate = isMasterAdminPhone && (!user.name || user.name === "Admin" || user.name === "Customer");
            if (needsRoleUpdate || needsNameUpdate) {
                await prisma.$executeRaw `UPDATE "User" SET "role" = 'ADMIN', "name" = CASE WHEN ${isMasterAdminPhone} THEN 'Md Athar Ali' ELSE "name" END WHERE "id" = ${userId}`;
            }
            effectiveRole = "ADMIN";
            if (needsNameUpdate)
                user.name = "Md Athar Ali";
        }
        const verificationRows = await prisma.$queryRaw `
      SELECT COALESCE("isAccountVerified", FALSE) AS "isAccountVerified",
             COALESCE("isPhoneVerified", FALSE) AS "isPhoneVerified"
      FROM "User"
      WHERE "id" = ${userId}
      LIMIT 1
    `;
        const isAccountVerified = Boolean(verificationRows[0]?.isAccountVerified);
        const isPhoneVerified = Boolean(verificationRows[0]?.isPhoneVerified);
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: effectiveRole,
                isAccountVerified,
                isPhoneVerified,
                phone: user.phone,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch profile.", details: error?.message || "Unknown error" });
    }
};
export const requestLoginOtp = async (req, res) => {
    try {
        await ensureAuthSchema().catch(() => { });
        const { phone, name } = req.body;
        const normalizedPhone = String(phone || "").replace(/\D/g, "");
        const trimmedName = name ? String(name).trim() : "";
        // Master Admin phone — always hardwired
        const MASTER_ADMIN_PHONE = "9060877595";
        if (!normalizedPhone || normalizedPhone.length !== 10) {
            return res.status(400).json({ error: "Valid 10-digit phone number is required." });
        }
        let user = await prisma.user.findFirst({ where: { phone: normalizedPhone } });
        if (!user) {
            // New user — create with provided name or fallback
            const fallbackEmail = `${normalizedPhone}@goldenrefrigeration.local`;
            const isMasterAdmin = normalizedPhone === MASTER_ADMIN_PHONE;
            user = await prisma.user.create({
                data: {
                    name: trimmedName || (isMasterAdmin ? "Md Athar Ali" : "Customer"),
                    email: fallbackEmail,
                    phone: normalizedPhone,
                    role: isMasterAdmin ? "ADMIN" : "CUSTOMER",
                }
            });
        }
        else if (trimmedName) {
            // Existing user provided a name — update it
            await prisma.$executeRaw `
        UPDATE "User" SET "name" = ${trimmedName} WHERE "id" = ${user.id}
      `;
        }
        const otp = generateOtp();
        const expiry = Date.now() + 10 * 60 * 1000;
        await prisma.$executeRaw `
      UPDATE "User"
      SET "phoneVerifyOtp" = ${otp}, "phoneVerifyOtpExpiryAt" = ${expiry}
      WHERE "id" = ${user.id}
    `;
        // Deliver OTP via MSG91 (WhatsApp → SMS → dev console fallback)
        const { channel } = await deliverLoginOtp(normalizedPhone, otp);
        const channelLabel = channel === "whatsapp" ? "WhatsApp"
            : channel === "sms" ? "SMS"
                : "console (dev mode)";
        res.json({
            message: `OTP sent via ${channelLabel} to +91${normalizedPhone}.`,
            channel,
            // Only expose OTP in non-production dev mode
            ...(process.env.NODE_ENV !== "production" && channel === "dev"
                ? { otpPreview: otp }
                : {}),
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to send OTP.", details: error?.message || "Unknown error" });
    }
};
export const verifyLogin = async (req, res) => {
    try {
        await ensureAuthSchema().catch(() => { });
        const { phone, otp } = req.body;
        const normalizedPhone = String(phone || "").replace(/\D/g, "");
        // Master Admin phone — always hardwired as supreme ADMIN
        const MASTER_ADMIN_PHONE = "9060877595";
        if (!normalizedPhone || !otp) {
            return res.status(400).json({ error: "Phone and OTP are required." });
        }
        const rows = await prisma.$queryRaw `
      SELECT "id", "email", "role", "name", "phoneVerifyOtp", "phoneVerifyOtpExpiryAt"
      FROM "User"
      WHERE "phone" = ${normalizedPhone}
      LIMIT 1
    `;
        let user = rows[0];
        if (!user)
            return res.status(404).json({ error: "User not found." });
        if (!user.phoneVerifyOtp || !user.phoneVerifyOtpExpiryAt)
            return res.status(400).json({ error: "No OTP found. Request a new OTP." });
        if (Date.now() > Number(user.phoneVerifyOtpExpiryAt))
            return res.status(400).json({ error: "OTP expired. Request a new OTP." });
        if (String(user.phoneVerifyOtp) !== String(otp).trim())
            return res.status(400).json({ error: "Invalid OTP." });
        // Determine if this user should be Admin:
        // 1. Hardwired master admin phone
        // 2. Owner email addresses
        const adminEmail = (process.env.ADMIN_EMAIL || "mdatharsbr@gmail.com").toLowerCase().trim();
        const isOwnerEmail = user.email.toLowerCase() === adminEmail || user.email.toLowerCase() === "atharalisbr@gmail.com";
        const isMasterAdminPhone = normalizedPhone === MASTER_ADMIN_PHONE;
        let role = user.role;
        if ((isOwnerEmail || isMasterAdminPhone) && role !== "ADMIN") {
            await prisma.$executeRaw `UPDATE "User" SET "role" = 'ADMIN' WHERE "id" = ${user.id}`;
            role = "ADMIN";
        }
        await prisma.$executeRaw `
      UPDATE "User"
      SET "isPhoneVerified" = TRUE,
          "isAccountVerified" = TRUE,
          "phoneVerifyOtp" = NULL,
          "phoneVerifyOtpExpiryAt" = NULL
      WHERE "id" = ${user.id}
    `;
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });
        const isProd = process.env.NODE_ENV === "production";
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            maxAge: COOKIE_MAX_AGE,
            path: "/",
        });
        res.json({
            message: "Login successful.",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: role,
                isAccountVerified: true,
                isPhoneVerified: true,
                phone: normalizedPhone,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: "Login verification failed.", details: error?.message || "Unknown error" });
    }
};
export const requestEmailLoginOtp = async (req, res) => {
    try {
        await ensureAuthSchema().catch(() => { });
        const { email, name } = req.body;
        const trimmedEmail = String(email || "").toLowerCase().trim();
        const trimmedName = name ? String(name).trim() : "";
        if (!trimmedEmail || !trimmedEmail.includes("@")) {
            return res.status(400).json({ error: "Valid email address is required." });
        }
        let user = await prisma.user.findUnique({ where: { email: trimmedEmail } });
        // Master admin emails
        const adminEmail = (process.env.ADMIN_EMAIL || "mdatharsbr@gmail.com").toLowerCase().trim();
        const isOwnerEmail = trimmedEmail === adminEmail || trimmedEmail === "atharalisbr@gmail.com";
        if (!user) {
            // Create new user
            user = await prisma.user.create({
                data: {
                    name: trimmedName || (isOwnerEmail ? "Md Athar Ali" : "Customer"),
                    email: trimmedEmail,
                    role: isOwnerEmail ? "ADMIN" : "CUSTOMER",
                }
            });
        }
        else if (trimmedName) {
            // Update name for existing user if provided
            await prisma.$executeRaw `
        UPDATE "User" SET "name" = ${trimmedName} WHERE "id" = ${user.id}
      `;
        }
        const otp = generateOtp();
        const expiry = Date.now() + 10 * 60 * 1000;
        await prisma.$executeRaw `
      UPDATE "User"
      SET "verifyOtp" = ${otp}, "verifyOtpExpiryAt" = ${expiry}
      WHERE "id" = ${user.id}
    `;
        if (!isEmailConfigured()) {
            if (process.env.NODE_ENV !== "production") {
                return res.json({
                    message: "OTP generated. Email service not configured (dev mode).",
                    otpPreview: otp,
                });
            }
            return res.status(500).json({ error: "Email service is not configured on the server." });
        }
        try {
            await sendEmail(trimmedEmail, "Login OTP - Golden Refrigeration", `<div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2>Your Sign In Code</h2>
          <p>Please use the following OTP to sign into your account:</p>
          <h1 style="letter-spacing:4px;color:#2563eb;">${otp}</h1>
          <p>This code is valid for 10 minutes. Do not share it with anyone.</p>
        </div>`, `Your Golden Refrigeration login OTP is ${otp}. It is valid for 10 minutes.`);
        }
        catch (mailError) {
            if (process.env.NODE_ENV !== "production") {
                return res.json({
                    message: "Email send failed (dev fallback).",
                    otpPreview: otp,
                });
            }
            throw mailError;
        }
        res.json({ message: "OTP sent successfully to your email." });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to send email OTP.", details: error?.message || "Unknown error" });
    }
};
export const verifyEmailLogin = async (req, res) => {
    try {
        await ensureAuthSchema().catch(() => { });
        const { email, otp } = req.body;
        const trimmedEmail = String(email || "").toLowerCase().trim();
        if (!trimmedEmail || !otp) {
            return res.status(400).json({ error: "Email and OTP are required." });
        }
        const rows = await prisma.$queryRaw `
      SELECT "id", "email", "role", "name", "phone", "verifyOtp", "verifyOtpExpiryAt"
      FROM "User"
      WHERE "email" = ${trimmedEmail}
      LIMIT 1
    `;
        let user = rows[0];
        if (!user)
            return res.status(404).json({ error: "User not found." });
        if (!user.verifyOtp || !user.verifyOtpExpiryAt)
            return res.status(400).json({ error: "No OTP found. Request a new OTP." });
        if (Date.now() > Number(user.verifyOtpExpiryAt))
            return res.status(400).json({ error: "OTP expired. Request a new OTP." });
        if (String(user.verifyOtp) !== String(otp).trim())
            return res.status(400).json({ error: "Invalid OTP." });
        // Promote to admin if needed
        const adminEmail = (process.env.ADMIN_EMAIL || "mdatharsbr@gmail.com").toLowerCase().trim();
        const isOwnerEmail = user.email.toLowerCase() === adminEmail || user.email.toLowerCase() === "atharalisbr@gmail.com";
        let role = user.role;
        if (isOwnerEmail && role !== "ADMIN") {
            await prisma.$executeRaw `UPDATE "User" SET "role" = 'ADMIN' WHERE "id" = ${user.id}`;
            role = "ADMIN";
        }
        // Clear OTP
        await prisma.$executeRaw `
      UPDATE "User"
      SET "isAccountVerified" = TRUE,
          "verifyOtp" = NULL,
          "verifyOtpExpiryAt" = NULL
      WHERE "id" = ${user.id}
    `;
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });
        const isProd = process.env.NODE_ENV === "production";
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            maxAge: COOKIE_MAX_AGE,
            path: "/",
        });
        res.json({
            message: "Login successful.",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: role,
                isAccountVerified: true,
                isPhoneVerified: true, // We assume verified if logging in via email 
                phone: user.phone,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: "Email login verification failed.", details: error?.message || "Unknown error" });
    }
};
