"use client";

import { useChatContext } from "@/context/ChatProvider";
import { useEffect, useRef, useState, useCallback } from "react";
import { Send, ArrowLeft } from "lucide-react";

const Message = () => {
  const {
    conversations,
    messages,
    activeConversation,
    fetchMessages,
    sendMessage,
    userId,
    setActiveConversation,
    clearActiveConversation,
  } = useChatContext();

  const [input, setInput] = useState("");
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [showConversations, setShowConversations] = useState(
    !activeConversation
  );
  const messagesEndRef = useRef(null);

  // Check if mobile view
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 640); // sm breakpoint
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Update showConversations when activeConversation changes
  useEffect(() => {
    if (isMobileView) {
      setShowConversations(!activeConversation);
    } else {
      setShowConversations(true); // Always show on desktop
    }
  }, [activeConversation, isMobileView]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeConversation) return;

    try {
      setError(null);
      setIsSending(true);
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
    } finally {
      setIsSending(false);
    }
  };

  const formatTimestamp = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle back button click
  const handleBackClick = useCallback(() => {
    if (isMobileView) {
      // Show conversation list on mobile
      setShowConversations(true);

      // Clear active conversation without triggering API call
      if (typeof clearActiveConversation === "function") {
        clearActiveConversation();
      } else if (setActiveConversation) {
        setActiveConversation(null);
      }
    }
  }, [isMobileView, clearActiveConversation, setActiveConversation]);

  // Handle conversation selection
  const handleConversationSelect = useCallback(
    (convId) => {
      fetchMessages(convId);
      if (isMobileView) {
        setShowConversations(false);
      }
    },
    [fetchMessages, isMobileView]
  );

  const activeConv = conversations.find(
    (conv) => conv._id === activeConversation
  );
  const recipient = activeConv?.participants.find((p) => p._id !== userId);

  return (
    <div className="h-[93.5vh] flex flex-col bg-background font-monserrat">
      {/* Flexible Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Conversation List - Only this scrolls */}
        {(showConversations || !isMobileView) && (
          <div
            className={`${
              isMobileView ? "w-full" : "w-1/3 lg:w-1/4"
            } border-r border-border overflow-y-auto`}
          >
            <div className="p-3 border-b border-border">
              <h4 className="font-medium text-sm text-muted-foreground px-2">
                Recent
              </h4>
            </div>
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
                const isActive = activeConversation === conv._id;

                return (
                  <div
                    key={conv._id}
                    onClick={() => handleConversationSelect(conv._id)}
                    className={`p-3 flex items-center space-x-3 cursor-pointer transition-colors ${
                      isActive
                        ? "bg-primary/10 dark:bg-primary/20"
                        : "hover:bg-secondary dark:hover:bg-secondary/10"
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={
                          otherParticipant?.profilePicture ||
                          "/avatar-placeholder.png"
                        }
                        alt={otherParticipant?.name}
                        className="w-12 h-12 rounded-full object-cover border border-border"
                      />
                      {isUnread && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background dark:border-card" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <p
                          className={`font-medium truncate ${
                            isUnread ? "text-foreground" : "text-foreground/80"
                          }`}
                        >
                          {otherParticipant?.name || "Unknown User"}
                        </p>
                        {conv.lastMessage?.createdAt && (
                          <span className="text-xs text-muted-foreground ml-1">
                            {formatTimestamp(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm truncate ${
                          isUnread
                            ? "text-foreground font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        {conv.lastMessage?.content || "No messages"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Messages Area - Only this scrolls */}
        {(!isMobileView || !showConversations) && (
          <div
            className={`${isMobileView ? "w-full" : "flex-1"} flex flex-col`}
          >
            {/* Fixed Header */}
            <div className="border-b border-border bg-card p-4 flex items-center justify-between shadow-sm z-10">
              {activeConversation && recipient ? (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleBackClick}
                    className="sm:hidden text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <img
                    src={recipient?.profilePicture || "/avatar-placeholder.png"}
                    alt={recipient?.name}
                    className="w-10 h-10 rounded-full object-cover border border-border"
                  />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {recipient?.name || "Unknown User"}
                    </h3>
                    <p className="text-xs text-muted-foreground">Active now</p>
                  </div>
                </div>
              ) : (
                <h3 className="text-lg font-semibold text-foreground">
                  Messages
                </h3>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/50 dark:bg-secondary/20">
              {activeConversation ? (
                messages.length > 0 ? (
                  messages.map((msg) => {
                    const isSender = msg.sender._id === userId;
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${
                          isSender ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex items-end space-x-2 max-w-[75%] ${
                            isSender ? "flex-row-reverse space-x-reverse" : ""
                          }`}
                        >
                          {!isSender && (
                            <img
                              src={
                                msg.sender.profilePicture ||
                                "/avatar-placeholder.png"
                              }
                              alt={msg.sender.name}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-border"
                            />
                          )}
                          <div>
                            <div
                              className={`p-3 rounded-2xl text-sm ${
                                isSender
                                  ? "bg-primary text-primary-foreground rounded-br-none"
                                  : "bg-card text-card-foreground rounded-bl-none shadow-sm dark:shadow-none"
                              }`}
                            >
                              {msg.content}
                            </div>
                            <div
                              className={`text-xs text-muted-foreground mt-1 ${
                                isSender ? "text-right" : "text-left"
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
                    <div className="text-center p-6 max-w-md">
                      <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-1">
                        No messages yet
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Send a message to start the conversation
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-6 max-w-md">
                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-1">
                      Your messages
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Select a conversation to start chatting
                    </p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Fixed Input Bar */}
            {activeConversation && (
              <div className="p-4 border-t border-border bg-card">
                {error && (
                  <div className="text-destructive text-sm mb-2 px-2">
                    {error}
                  </div>
                )}
                <div className="flex items-center space-x-2 bg-secondary dark:bg-secondary/30 rounded-full px-4 py-1">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    className="flex-1 py-2 bg-transparent text-foreground placeholder-muted-foreground text-sm focus:outline-none"
                    placeholder="Message..."
                    disabled={!activeConversation || isSending}
                  />
                  <button
                    onClick={handleSend}
                    className={`p-2 rounded-full transition-colors ${
                      input.trim() && activeConversation && !isSending
                        ? "text-primary hover:text-primary/80"
                        : "text-muted-foreground cursor-not-allowed"
                    }`}
                    disabled={!activeConversation || !input.trim() || isSending}
                    aria-label="Send message"
                  >
                    {isSending ? (
                      <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
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

export default Message;
