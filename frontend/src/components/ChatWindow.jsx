import { useChatContext } from "@/context/ChatProvider";
import { useEffect, useRef, useState } from "react";
import { Send, X, ChevronLeft } from "lucide-react";

export const ChatWindow = () => {
  const {
    isChatOpen,
    conversations,
    messages,
    activeConversation,
    fetchMessages,
    sendMessage,
    setIsChatOpen,
    userId,
  } = useChatContext();

  const [input, setInput] = useState("");
  const [error, setError] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversations, setShowConversations] = useState(true);
  const messagesEndRef = useRef(null);

  // Check if mobile view on mount and window resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 768);
      // On mobile, start with conversation list if no active conversation
      if (window.innerWidth < 768) {
        setShowConversations(!activeConversation);
      } else {
        setShowConversations(true);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, [activeConversation]);

  // Handle conversation selection on mobile
  useEffect(() => {
    if (isMobileView && activeConversation) {
      setShowConversations(false);
    }
  }, [activeConversation, isMobileView]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeConversation) return;

    try {
      setError(null);
      const conversation = conversations.find(
        (conv) => conv._id === activeConversation
      );
      if (!conversation) {
        setError("Conversation not found");
        return;
      }
      const receiverId = conversation.participants.find(
        (participant) => participant._id !== userId
      )?._id;
      if (!receiverId) {
        setError("No recipient found for this conversation");
        return;
      }

      await sendMessage(input, activeConversation, receiverId);
      setInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
      setError("Failed to send message");
    }
  };

  const formatTimestamp = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isChatOpen) return null;

  const activeConv = conversations.find(
    (conv) => conv._id === activeConversation
  );
  const recipient = activeConv?.participants.find((p) => p._id !== userId);

  return (
    <div className="fixed bottom-4 right-4 w-[90vw] sm:w-[28rem] md:w-[40rem] max-w-[95vw] h-[30rem] max-h-[80vh] bg-card rounded-2xl shadow-xl flex flex-col border border-border md:bottom-6 md:right-6 z-50">
      {/* Header */}
      <div className="p-3 md:p-4 border-b border-border flex justify-between items-center bg-card rounded-t-2xl">
        {isMobileView && activeConversation && !showConversations ? (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowConversations(true)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Back to conversations"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <img
                src={recipient?.profilePicture || "/avatar-placeholder.png"}
                alt={recipient?.name}
                className="w-8 h-8 rounded-full object-cover border border-border"
              />
              <h3 className="text-base font-semibold text-foreground">
                {recipient?.name || "Unknown User"}
              </h3>
            </div>
          </div>
        ) : (
          <h3 className="text-base md:text-lg font-semibold text-foreground">
            Messages
          </h3>
        )}
        <button
          onClick={() => setIsChatOpen(false)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List */}
        {(showConversations || !isMobileView) && (
          <div
            className={`${
              isMobileView ? "w-full" : "w-1/3"
            } border-r border-border bg-secondary/30 dark:bg-secondary/10 overflow-y-auto`}
          >
            {conversations.length === 0 ? (
              <div className="p-4 text-muted-foreground text-sm">
                No conversations yet. Start one from a property page.
              </div>
            ) : (
              conversations.map((conv) => {
                const otherParticipant = conv.participants.find(
                  (p) => p._id !== userId
                );
                const isUnread =
                  conv.lastMessage &&
                  conv.lastMessage.sender._id !== userId &&
                  !conv.lastMessage.read;
                return (
                  <div
                    key={conv._id}
                    onClick={() => {
                      fetchMessages(conv._id);
                      if (isMobileView) {
                        setShowConversations(false);
                      }
                    }}
                    className={`p-3 flex items-center space-x-3 cursor-pointer transition-colors ${
                      activeConversation === conv._id
                        ? "bg-primary/10 dark:bg-primary/20"
                        : "hover:bg-secondary dark:hover:bg-secondary/20"
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={
                          otherParticipant?.profilePicture ||
                          "/avatar-placeholder.png"
                        }
                        alt={otherParticipant?.name}
                        className="w-10 h-10 rounded-full object-cover border border-border"
                      />
                      {isUnread && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background dark:border-card" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <div
                          className={`truncate font-medium text-sm ${
                            isUnread ? "text-foreground" : "text-foreground/80"
                          }`}
                        >
                          {otherParticipant?.name || "Unknown User"}
                        </div>
                        {conv.lastMessage?.createdAt && (
                          <span className="text-xs text-muted-foreground ml-1">
                            {formatTimestamp(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-xs truncate ${
                          isUnread
                            ? "text-foreground font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        {conv.lastMessage?.content || "No messages"}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Messages Area */}
        {(!isMobileView || !showConversations) && (
          <div
            className={`${
              isMobileView ? "w-full" : "w-2/3"
            } flex flex-col bg-card`}
          >
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-secondary/50 dark:bg-secondary/20">
              {activeConversation ? (
                messages.length > 0 ? (
                  messages.map((msg) => {
                    const isSent = msg.sender._id === userId;
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${
                          isSent ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex items-end space-x-2 max-w-[75%] ${
                            isSent ? "flex-row-reverse space-x-reverse" : ""
                          }`}
                        >
                          {!isSent && (
                            <img
                              src={
                                msg.sender.profilePicture ||
                                "/avatar-placeholder.png"
                              }
                              alt={msg.sender.name}
                              className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover border border-border"
                            />
                          )}
                          <div>
                            <div
                              className={`p-2 md:p-3 rounded-2xl text-sm ${
                                isSent
                                  ? "bg-primary text-primary-foreground rounded-br-none"
                                  : "bg-card text-card-foreground rounded-bl-none shadow-sm dark:shadow-none border border-border"
                              }`}
                            >
                              {msg.content}
                            </div>
                            <div
                              className={`text-xs text-muted-foreground mt-1 ${
                                isSent ? "text-right" : "text-left"
                              }`}
                            >
                              {formatTimestamp(msg.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-4 max-w-md">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                        <Send className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-base md:text-lg font-medium text-foreground mb-1">
                        No messages yet
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Send a message to start the conversation
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-4 max-w-md">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <Send className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-base md:text-lg font-medium text-foreground mb-1">
                      Your messages
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Select a conversation to start chatting
                    </p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            {activeConversation && (
              <div className="p-3 md:p-4 border-t border-border bg-card">
                {error && (
                  <div className="text-destructive text-xs md:text-sm mb-2">
                    {error}
                  </div>
                )}
                <div className="flex items-center space-x-2 bg-secondary dark:bg-secondary/30 rounded-full px-3 md:px-4 py-1">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    className="flex-1 py-2 bg-transparent text-foreground placeholder-muted-foreground text-sm focus:outline-none"
                    placeholder="Type a message..."
                    disabled={!activeConversation}
                  />
                  <button
                    onClick={handleSend}
                    className={`p-2 rounded-full transition-colors ${
                      input.trim() && activeConversation
                        ? "text-primary hover:text-primary/80"
                        : "text-muted-foreground cursor-not-allowed"
                    }`}
                    disabled={!activeConversation || !input.trim()}
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
