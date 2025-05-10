/* eslint-disable no-unused-vars */
import { useEffect, useState, useCallback } from "react";
import { connectSocket, getSocket, disconnectSocket } from "../lib/socket";
import { toast } from "react-toastify";

export const useChat = (userId) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      console.log("Fetching conversations for user:", userId);
      const response = await fetch(
        `http://localhost:5000/api/chat/conversations`,
        { credentials: "include" }
      );
      const data = await response.json();
      if (data.success) {
        console.log("Conversations fetched:", data.conversations);
        setConversations(data.conversations);
      } else {
        console.error("Failed to fetch conversations:", data.message);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  }, [userId]);

  // Fetch messages
  const fetchMessages = useCallback(
    async (conversationId) => {
      try {
        console.log("Fetching messages for conversation:", conversationId);
        const response = await fetch(
          `http://localhost:5000/api/chat/conversations/${conversationId}/messages`,
          { credentials: "include" }
        );
        const data = await response.json();
        if (data.success) {
          console.log("Messages fetched:", data.messages);
          setMessages(data.messages);
          setActiveConversation(conversationId);
          setUnreadCount(
            (prev) =>
              prev -
              data.messages.filter(
                (msg) => msg.sender._id !== userId && !msg.read
              ).length
          );
        } else {
          console.error("Failed to fetch messages:", data.message);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    },
    [userId]
  );

  // Start a new conversation
  const startConversation = useCallback(
    async (receiverId, propertyId) => {
      try {
        console.log(
          "Starting conversation with receiver:",
          receiverId,
          "for property:",
          propertyId
        );
        const response = await fetch(
          `http://localhost:5000/api/chat/conversations/start`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ receiverId, propertyId }),
          }
        );
        const data = await response.json();
        if (data.success) {
          console.log("Conversation started:", data.conversation);
          setConversations((prev) => {
            const exists = prev.find((c) => c._id === data.conversation._id);
            if (exists) return prev;
            return [data.conversation, ...prev];
          });
          setActiveConversation(data.conversation._id);
          await fetchMessages(data.conversation._id);
          await fetchConversations();
          return data.conversation;
        } else {
          console.error("Failed to start conversation:", data.message);
          throw new Error(data.message);
        }
      } catch (error) {
        console.error("Error starting conversation:", error);
        throw error;
      }
    },
    [fetchMessages, fetchConversations]
  );

  // Send message
  const sendMessage = useCallback(
    async (content, conversationId, receiverId, propertyId) => {
      if (!socket || !content.trim() || !receiverId) {
        throw new Error("Invalid message parameters");
      }

      return new Promise((resolve, reject) => {
        console.log("Sending message to conversation:", conversationId);
        socket.emit(
          "sendMessage",
          {
            conversationId,
            senderId: userId,
            content,
            propertyId,
            receiverId,
          },
          (response) => {
            if (response.success) {
              console.log("Message sent:", response.message);
              if (conversationId === activeConversation) {
                setMessages((prev) => {
                  // Avoid duplicates
                  if (prev.some((msg) => msg._id === response.message._id)) {
                    return prev;
                  }
                  return [...prev, response.message];
                });
              }
              resolve(response.message);
            } else {
              console.error("Send message failed:", response.error);
              reject(new Error(response.error));
            }
          }
        );
      });
    },
    [socket, userId, activeConversation]
  );

  // Initialize socket connection
  useEffect(() => {
    if (!userId) return;

    const setupSocket = async () => {
      try {
        const socket = await connectSocket(userId);
        setSocket(socket);
        setIsConnected(true);

        socket.on("newMessage", (message) => {
          console.log("Received new message:", message);
          if (message.conversation === activeConversation) {
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((msg) => msg._id === message._id)) {
                return prev;
              }
              return [...prev, message];
            });
          }
          if (
            message.sender._id !== userId &&
            message.conversation !== activeConversation
          ) {
            setUnreadCount((prev) => prev + 1);
          }
        });

        socket.on("conversationUpdated", (conversation) => {
          console.log("Conversation updated:", conversation);
          setConversations((prev) => {
            const existing = prev.find((c) => c._id === conversation._id);
            return existing
              ? prev.map((c) => (c._id === conversation._id ? conversation : c))
              : [conversation, ...prev];
          });
        });

        socket.on("disconnect", () => {
          console.log("Socket disconnected");
          setIsConnected(false);
        });
      } catch (error) {
        console.error("Socket connection failed:", error);
        toast.error("Failed to connect to chat. Please try again.");
      }
    };

    setupSocket();

    return () => {
      disconnectSocket();
    };
  }, [userId]);

  // Fetch conversations on mount
  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId, fetchConversations]);

  // Compute unread count
  useEffect(() => {
    const count = conversations.reduce((total, conv) => {
      const lastMessage = conv.lastMessage;
      if (
        lastMessage &&
        lastMessage.sender._id !== userId &&
        !lastMessage.read
      ) {
        return total + 1;
      }
      return total;
    }, 0);
    setUnreadCount(count);
  }, [conversations, userId]);

  return {
    socket,
    isConnected,
    conversations,
    messages,
    activeConversation,
    fetchConversations,
    fetchMessages,
    startConversation,
    sendMessage,
    unreadCount,
  };
};
