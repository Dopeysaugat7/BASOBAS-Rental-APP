import { Server } from "socket.io";
import { Conversation, Message } from "./models/chatModel.js";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/socket.io",
    transports: ["websocket", "polling"],
    allowEIO3: true,
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("joinUserRoom", (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    socket.on("sendMessage", async (data, callback) => {
      try {
        const { conversationId, senderId, content, propertyId, receiverId } =
          data;

        if (!senderId || !content || !receiverId) {
          console.error("Missing required fields:", {
            senderId,
            content,
            receiverId,
          });
          throw new Error("Missing required fields");
        }

        let conversation;
        if (conversationId) {
          conversation = await Conversation.findById(conversationId);
          if (!conversation) {
            console.error("Conversation not found:", conversationId);
            throw new Error("Conversation not found");
          }
        } else {
          conversation = new Conversation({
            participants: [senderId, receiverId],
            property: propertyId,
          });
          await conversation.save();
          console.log("New conversation created:", conversation._id);
        }

        const message = new Message({
          conversation: conversation._id,
          sender: senderId,
          content,
        });
        await message.save();
        console.log("Message saved:", message._id);

        conversation.lastMessage = message._id;
        await conversation.save();

        const [populatedMessage, updatedConversation] = await Promise.all([
          Message.findById(message._id)
            .populate("sender", "name profilePicture")
            .exec(),
          Conversation.findById(conversation._id)
            .populate("participants", "name profilePicture")
            .populate("lastMessage")
            .populate("property", "title images")
            .exec(),
        ]);

        console.log(
          "Emitting newMessage to:",
          `user_${senderId}`,
          `user_${receiverId}`
        );
        io.to(`user_${senderId}`).emit("newMessage", populatedMessage);
        io.to(`user_${receiverId}`).emit("newMessage", populatedMessage);

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

        if (callback) {
          callback({ success: true, message: populatedMessage });
        }
      } catch (error) {
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

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
