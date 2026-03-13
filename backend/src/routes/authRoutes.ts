import { Router } from "express";
import {
  login,
  logout,
  register,
  resetPassword,
  sendResetOtp,
  sendVerifyOtp,
  verifyOtp,
} from "../controllers/authController.js";
import { userAuth } from "../middlewares/authMiddleware.js";

const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.post("/send-verify-otp", userAuth, sendVerifyOtp);
authRoutes.post("/verify-otp", userAuth, verifyOtp);
authRoutes.post("/send-reset-otp", sendResetOtp);
authRoutes.post("/reset-password", resetPassword);

export default authRoutes;
