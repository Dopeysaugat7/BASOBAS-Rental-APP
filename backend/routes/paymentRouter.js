import express from "express";
import {
  checkPayment,
  createPayment,
  getUserPayments,
  verifyPayment,
} from "../controllers/paymentController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/create", isAuthenticated, createPayment);
router.get("/verify", isAuthenticated, verifyPayment);
router.get("/my-payments", isAuthenticated, getUserPayments);
router.post("/check", isAuthenticated, checkPayment);

export default router;
