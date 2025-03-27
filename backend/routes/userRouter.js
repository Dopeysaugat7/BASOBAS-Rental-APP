import express from "express";
import * as userController from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Authentication Routes
router.post("/register", userController.register);
router.post("/otp-verification", userController.verifyOTP);
router.post("/send-verification", userController.sendVerification);
router.post(
  "/resend-verification",
  isAuthenticated,
  userController.resendVerification
);
router.post("/login", userController.login);
router.post("/logout", isAuthenticated, userController.logout);

// User Routes
router.get("/me", isAuthenticated, userController.getUser);
router
  .route("/me/update")
  .put(
    isAuthenticated,
    userController.uploadUserPhoto,
    userController.updateUser
  );
router.delete("/me/delete-user", isAuthenticated, userController.deleteUser);
router.post(
  "/me/change-password",
  isAuthenticated,
  userController.changePassword
);

router.route("/me/delete").delete(isAuthenticated, userController.deleteUser);

// Password Reset Routes
router.post("/password/forgot", userController.forgotPassword);
router.put("/password/reset/:token", userController.resetPassword);

export default router;
