import express from "express";
import * as visitController from "../controllers/visitController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/book", isAuthenticated, visitController.bookVisit);
router.put(
  "/:visitId/status",
  isAuthenticated,
  visitController.updateVisitStatus
);
router.get("/host", isAuthenticated, visitController.getHostVisits);

export default router;
