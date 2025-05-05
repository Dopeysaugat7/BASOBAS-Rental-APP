import { Conversation, Message } from "../models/chatModel.js";
import { User } from "../models/userModel.js";
import { Property } from "../models/propertyModel.js";
import { getIO } from "../socket.js";

// Get all conversations for a user
export const getUserConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "name profilePicture")
      .populate("lastMessage")
      .populate("property", "title images")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    next(error);
  }
};

// Get messages in a conversation
export const getConversationMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this conversation",
      });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "name profilePicture")
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        read: false,
      },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// Start a new conversation
export const startConversation = async (req, res, next) => {
  try {
    const { propertyId, receiverId } = req.body;
    const senderId = req.user._id;

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
      property: propertyId,
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
        property: propertyId,
      });
      await conversation.save();
    }

    // Populate the conversation data
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate("participants", "name profilePicture")
      .populate("property", "title images")
      .exec();

    res.status(200).json({
      success: true,
      conversation: populatedConversation,
    });
  } catch (error) {
    next(error);
  }
};
