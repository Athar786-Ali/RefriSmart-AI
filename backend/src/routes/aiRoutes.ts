import { Router } from "express";
import { diagnose } from "../controllers/aiController.js";
import multer from "multer";

const upload = multer({ dest: "tmp/", limits: { fileSize: 25 * 1024 * 1024 } });
const aiRoutes = Router();

aiRoutes.post("/diagnose", upload.single("media"), diagnose);

export default aiRoutes;
