import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/runtime.js";
import { prisma } from "../config/prisma.js";
const extractUserIdFromRequest = (req) => {
    const cookieToken = req.cookies?.token;
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    const token = cookieToken || bearerToken;
    if (!token)
        return null;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded?.userId || null;
    }
    catch {
        return null;
    }
};
export const resolveUserIdFromRequest = (req) => extractUserIdFromRequest(req);
export const userAuth = async (req, res, next) => {
    try {
        const userId = extractUserIdFromRequest(req);
        if (!userId)
            return res.status(401).json({ error: "Unauthorized. Login required." });
        req.userId = userId;
        next();
    }
    catch {
        return res.status(401).json({ error: "Unauthorized. Invalid or expired token." });
    }
};
export const adminAuth = async (req, res, next) => {
    await userAuth(req, res, async () => {
        try {
            const userId = req.userId;
            if (!userId)
                return res.status(403).json({ error: "Admin access required." });
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user || user.role !== "ADMIN") {
                return res.status(403).json({ error: "Admin access required." });
            }
            next();
        }
        catch {
            return res.status(403).json({ error: "Admin access required." });
        }
    });
};
