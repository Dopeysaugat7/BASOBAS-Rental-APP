import express from "express";
import * as userController from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Authentication Routes
router.post("/register", userController.register);
router.post("/otp-verification", userController.verifyOTP);
router.post("/login", userController.login);
router.get("/logout", isAuthenticated, userController.logout);

// User Routes
router.get("/me", isAuthenticated, userController.getUser);

// Password Reset Routes
router.post("/password/forgot", userController.forgotPassword);
router.put("/password/reset/:token", userController.resetPassword);

export default router;
