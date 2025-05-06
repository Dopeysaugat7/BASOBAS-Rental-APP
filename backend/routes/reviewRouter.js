import express from "express";
import {
  createReview,
  getPropertyReviews,
  updateReview,
  deleteReview,
  getPopularReviews,
} from "../controllers/reviewController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.get("/:propertyId", getPropertyReviews);
router.get("/:propertyId/popular", getPopularReviews);

// Protected routes
router.post("/", isAuthenticated, createReview);
router.put("/:id", isAuthenticated, updateReview);
router.delete("/:id", isAuthenticated, deleteReview);

export default router;
