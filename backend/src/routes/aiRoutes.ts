import { Router } from "express";
import { diagnose } from "../controllers/aiController.js";

const aiRoutes = Router();

aiRoutes.post("/diagnose", diagnose);

export default aiRoutes;
