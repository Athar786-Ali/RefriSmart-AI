import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "node:path";
import aiRoutes from "./routes/aiRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import { PORT } from "./config/runtime.js";
const app = express();
// Issue #1 Fix: origin:true allows ANY website to make credentialed requests.
// In production we restrict to an explicit comma-separated allowlist.
const getAllowedOrigins = () => {
    if (process.env.NODE_ENV !== "production")
        return true;
    const raw = process.env.ALLOWED_ORIGINS || "";
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
};
app.use(cors({
    origin: getAllowedOrigins(),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(cookieParser());
app.use(express.json({ limit: "100mb" }));
app.use("/uploads", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
}, express.static(path.resolve(process.cwd(), "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", productRoutes);
app.use("/api", adminRoutes);
const HOST = process.env.HOST || "localhost";
app.listen(PORT, HOST, () => {
    console.log(`✅ Server is ACTIVE on http://${HOST}:${PORT}`);
});
