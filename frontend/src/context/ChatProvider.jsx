import { createContext, useContext, useState } from "react";
import { useChat } from "../hooks/useChat";
import { useAuth } from "./AuthContext";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const chat = useChat(user?._id);
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <ChatContext.Provider
      value={{
        socket: chat.socket,
        isConnected: chat.isConnected,
        conversations: chat.conversations,
        messages: chat.messages,
        activeConversation: chat.activeConversation,
        fetchConversations: chat.fetchConversations,
        fetchMessages: chat.fetchMessages,
        startConversation: chat.startConversation,
        sendMessage: chat.sendMessage,
        unreadCount: chat.unreadCount,
        isChatOpen,
        setIsChatOpen,
        userId: user?._id,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);
