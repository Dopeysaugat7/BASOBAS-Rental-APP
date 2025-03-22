// routes/superAdminRoutes.js
import express from "express";
import {
  forgotPassword,
  getSuperAdminDashboard,
  loginSuperAdmin,
  registerSuperAdmin,
  resetPassword,
  updateAllowedIPs,
  verifyOTP,
} from "../controllers/adminController.js";
import { verifyIP } from "../middlewares/verifyIP.js";
import { authorizeSuperAdmin } from "../middlewares/authorizeSuperAdmin.js";

const router = express.Router();

// SuperAdmin registration and login
router.post("/register", registerSuperAdmin);
router.post("/login", loginSuperAdmin);

// Protected routes (require authentication and IP verification)
router.get("/dashboard", authorizeSuperAdmin, verifyIP, getSuperAdminDashboard);

// routes/superAdminRoutes.js
router.put("/update-ips", authorizeSuperAdmin, verifyIP, updateAllowedIPs);

// Password reset and verification
router.post("/register", registerSuperAdmin);
router.post("/verify-otp", verifyOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
