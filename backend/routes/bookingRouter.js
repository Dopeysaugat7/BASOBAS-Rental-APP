import express from "express";
import {
  createBooking,
  verifyPayment,
  getUserBookings,
  terminateBooking,
} from "../controllers/bookingController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/book", isAuthenticated, createBooking);
router.get("/verify-payment", verifyPayment);
router.get("/my-bookings", isAuthenticated, getUserBookings);
router.post("/terminate", isAuthenticated, terminateBooking);

export default router;
