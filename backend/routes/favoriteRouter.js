import express from "express";
import {
  addToFavorites,
  checkFavoriteStatus,
  getFavorites,
  removeFromFavorites,
} from "../controllers/favoriteController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/:propertyId", isAuthenticated, addToFavorites);
router.delete("/:propertyId", isAuthenticated, removeFromFavorites);
router.get("/", isAuthenticated, getFavorites);
router.get("/:propertyId/status", isAuthenticated, checkFavoriteStatus);

export default router;
