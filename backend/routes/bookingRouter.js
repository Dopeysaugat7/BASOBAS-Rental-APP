import express from "express";
import {
  createBooking,
  verifyPayment,
  getUserBookings,
  terminateBooking,
  getBookingStatus,
  checkPaymentStatus,
  verifyMonthlyPayment,
  createMonthlyPayment,
} from "../controllers/bookingController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/book", isAuthenticated, createBooking);
router.get("/verify-payment", verifyPayment);
router.post("/create-monthly-payment", isAuthenticated, createMonthlyPayment);
router.get("/verify-monthly-payment", verifyMonthlyPayment);
router.post("/check-payment", isAuthenticated, checkPaymentStatus);
router.post("/terminate", isAuthenticated, terminateBooking);
router.get("/my-bookings", isAuthenticated, getUserBookings);
router.get("/status/:bookingId", isAuthenticated, getBookingStatus);

export default router;
