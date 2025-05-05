import express from "express";
import {
  getUserConversations,
  getConversationMessages,
  startConversation,
} from "../controllers/chatController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Get user conversations
router.get("/conversations", isAuthenticated, getUserConversations);

// Get conversation messages
router.get(
  "/conversations/:conversationId/messages",
  isAuthenticated,
  getConversationMessages
);

// Start new conversation
router.post("/conversations/start", isAuthenticated, startConversation);

export default router;
