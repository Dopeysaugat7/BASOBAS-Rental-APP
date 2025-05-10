// Import required dependencies
import { Server } from "socket.io";
import { Conversation, Message } from "./models/chatModel.js";

// Declare io variable to store Socket.IO instance
let io;

// Initialize Socket.IO with the provided server
export const initializeSocket = (server) => {
  // Configure Socket.IO with CORS, path, and transport options
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // Allow frontend origins
      methods: ["GET", "POST"],
      credentials: true, // Enable cookies for authentication
    },
    path: "/socket.io", // Custom path for Socket.IO
    transports: ["websocket", "polling"], // Support WebSocket and fallback to polling
    allowEIO3: true, // Ensure compatibility with older clients
  });

  // Handle new client connections
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`); // Log connection

    // Event: User joins their personal room
    socket.on("joinUserRoom", (userId) => {
      socket.join(`user_${userId}`); // Add socket to user-specific room
      console.log(`User ${userId} joined their room`);
    });

    // Event: Handle sending a message
    socket.on("sendMessage", async (data, callback) => {
      try {
        // Destructure message data
        const { conversationId, senderId, content, propertyId, receiverId } =
          data;

        // Validate required fields
        if (!senderId || !content || !receiverId) {
          console.error("Missing required fields:", {
            senderId,
            content,
            receiverId,
          });
          throw new Error("Missing required fields");
        }

        let conversation;
        // Check if conversation exists or create a new one
        if (conversationId) {
          conversation = await Conversation.findById(conversationId);
          if (!conversation) {
            console.error("Conversation not found:", conversationId);
            throw new Error("Conversation not found");
          }
        } else {
          // Create new conversation with participants and property
          conversation = new Conversation({
            participants: [senderId, receiverId],
            property: propertyId,
          });
          await conversation.save();
          console.log("New conversation created:", conversation._id);
        }

        // Create and save new message
        const message = new Message({
          conversation: conversation._id,
          sender: senderId,
          content,
        });
        await message.save();
        console.log("Message saved:", message._id);

        // Update conversation with the latest message
        conversation.lastMessage = message._id;
        await conversation.save();

        // Populate message and conversation data for client
        const [populatedMessage, updatedConversation] = await Promise.all([
          Message.findById(message._id)
            .populate("sender", "name profilePicture") // Include sender details
            .exec(),
          Conversation.findById(conversation._id)
            .populate("participants", "name profilePicture") // Include participant details
            .populate("lastMessage") // Include last message
            .populate("property", "title images") // Include property details
            .exec(),
        ]);

        // Emit new message to sender and receiver
        console.log(
          "Emitting newMessage to:",
          `user_${senderId}`,
          `user_${receiverId}`
        );
        io.to(`user_${senderId}`).emit("newMessage", populatedMessage);
        io.to(`user_${receiverId}`).emit("newMessage", populatedMessage);

        // Emit updated conversation to sender and receiver
        console.log(
          "Emitting conversationUpdated to:",
          `user_${senderId}`,
          `user_${receiverId}`
        );
        io.to(`user_${senderId}`).emit(
          "conversationUpdated",
          updatedConversation
        );
        io.to(`user_${receiverId}`).emit(
          "conversationUpdated",
          updatedConversation
        );

        // Send success response to client callback
        if (callback) {
          callback({ success: true, message: populatedMessage });
        }
      } catch (error) {
        // Log and handle errors
        console.error("Error sending message:", error.message, error.stack);
        if (callback) {
          callback({ success: false, error: error.message });
        }
        socket.emit("error", {
          message: "Failed to send message",
          error: error.message,
        });
      }
    });

    // Handle client disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io; // Return Socket.IO instance
};

// Utility function to access Socket.IO instance
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!"); // Ensure io is initialized
  }
  return io;
};
