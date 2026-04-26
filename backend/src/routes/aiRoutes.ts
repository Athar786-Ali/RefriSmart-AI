import { Router } from "express";
import { diagnose, getMyDiagnosisHistory } from "../controllers/aiController.js";
import multer from "multer";
import { userAuth } from "../middlewares/authMiddleware.js";

const upload = multer({ dest: "/tmp", limits: { fileSize: 25 * 1024 * 1024 } });
const aiRoutes = Router();

aiRoutes.post("/diagnose", upload.single("media"), diagnose);
aiRoutes.get("/history", userAuth, getMyDiagnosisHistory);

export default aiRoutes;
