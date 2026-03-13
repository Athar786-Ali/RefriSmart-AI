import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import aiRoutes from "./routes/aiRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import { PORT } from "./config/runtime.js";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "12mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", productRoutes);
app.use("/api", adminRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server is ACTIVE on http://localhost:${PORT}`);
});
