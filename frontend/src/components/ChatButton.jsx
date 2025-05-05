import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useChatContext } from "@/context/ChatProvider";

export const ChatButton = () => {
  const { isChatOpen, setIsChatOpen, unreadCount } = useChatContext();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="rounded-full h-14 w-14 shadow-lg relative"
      >
        <MessageCircle className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>
    </div>
  );
};
