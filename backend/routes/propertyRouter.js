// routes/propertyRoutes.js
import express from "express";
import {
  createProperty,
  getAllProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  uploadImages,
  setPrimaryImage,
  deleteImage,
  getPropertiesByHost,
  getPropertiesNearLocation,
  getPropertyVisits,
} from "../controllers/propertyController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { uploadPropertyImages } from "../middlewares/fileupload.js";

const router = express.Router();

// Public routes
router.get("/", getAllProperties);
router.get("/near/:zipcode/:distance", getPropertiesNearLocation);
router.get("/:id", getProperty);
router.get("/host/:userId", getPropertiesByHost);

// Protected routes (require authentication)
router.post("/", isAuthenticated, uploadPropertyImages, createProperty);
router.put("/:id", isAuthenticated, uploadPropertyImages, updateProperty);
router.delete("/:id", isAuthenticated, deleteProperty);

// Image management routes
router.put("/:id/images", isAuthenticated, uploadPropertyImages, uploadImages);
router.put("/:id/primary-image", isAuthenticated, setPrimaryImage);
router.delete("/:id/images/:imageId", isAuthenticated, deleteImage);

router.get("/:propertyId/visits", isAuthenticated, getPropertyVisits);

export default router;
