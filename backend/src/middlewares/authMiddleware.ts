import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/runtime.js";

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

