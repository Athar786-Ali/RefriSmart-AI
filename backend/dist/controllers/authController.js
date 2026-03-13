import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { COOKIE_MAX_AGE, JWT_SECRET, ensureAuthSchema, generateOtp, sendEmail, } from "../config/runtime.js";
export const register = async (req, res) => {
    try {
        await ensureAuthSchema().catch(() => { });
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email, and password are required." });
        }
        const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
        if (existingUser) {
            return res.status(409).json({ error: "User already exists with this email." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name: name.trim(), email: email.toLowerCase().trim(), password: hashedPassword },
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
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
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
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
        const isProd = process.env.NODE_ENV === "production";
        const verificationRows = await prisma.$queryRaw `
      SELECT COALESCE("isAccountVerified", FALSE) AS "isAccountVerified"
      FROM "User"
      WHERE "id" = ${user.id}
      LIMIT 1
    `;
        const isAccountVerified = Boolean(verificationRows[0]?.isAccountVerified);
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
                role: user.role,
                isAccountVerified,
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
        const otp = generateOtp();
        const expiry = Date.now() + 24 * 60 * 60 * 1000;
        await prisma.$executeRaw `
      UPDATE "User"
      SET "verifyOtp" = ${otp}, "verifyOtpExpiryAt" = ${expiry}
      WHERE "id" = ${userId}
    `;
        await sendEmail(user.email, "Verify your Golden Refrigeration account", `<div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Account Verification OTP</h2>
        <p>Your OTP is:</p>
        <h1 style="letter-spacing:4px">${otp}</h1>
        <p>This OTP is valid for 24 hours.</p>
      </div>`, `Your Golden Refrigeration verification OTP is ${otp}. It is valid for 24 hours.`);
        res.json({ message: "Verification OTP sent to your email." });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to send verification OTP.", details: error?.message || "Unknown error" });
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
        await sendEmail(user.email, "Golden Refrigeration password reset OTP", `<div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Password Reset OTP</h2>
        <p>Your OTP is:</p>
        <h1 style="letter-spacing:4px">${otp}</h1>
        <p>This OTP is valid for 15 minutes.</p>
      </div>`, `Your Golden Refrigeration password reset OTP is ${otp}. It is valid for 15 minutes.`);
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
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });
        await prisma.$executeRaw `
      UPDATE "User"
      SET "resetOtp" = NULL, "resetOtpExpiryAt" = NULL
      WHERE "id" = ${user.id}
    `;
        res.json({ message: "Password updated successfully." });
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
        const verificationRows = await prisma.$queryRaw `
      SELECT COALESCE("isAccountVerified", FALSE) AS "isAccountVerified"
      FROM "User"
      WHERE "id" = ${userId}
      LIMIT 1
    `;
        const isAccountVerified = Boolean(verificationRows[0]?.isAccountVerified);
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isAccountVerified,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch profile.", details: error?.message || "Unknown error" });
    }
};
