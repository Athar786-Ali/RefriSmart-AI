import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/runtime.js";
import { prisma } from "../config/prisma.js";

export type AuthenticatedRequest = Request & { userId?: string };

export const userAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: "Unauthorized. Login required." });

    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & { userId?: string };
    if (!decoded?.userId) return res.status(401).json({ error: "Invalid token." });

    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized. Invalid or expired token." });
  }
};

export const adminAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  await userAuth(req, res, async () => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(403).json({ error: "Admin access required." });
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || user.role !== "ADMIN") {
        return res.status(403).json({ error: "Admin access required." });
      }
      next();
    } catch {
      return res.status(403).json({ error: "Admin access required." });
    }
  });
};
