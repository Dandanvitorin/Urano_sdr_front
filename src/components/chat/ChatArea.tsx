import { useLeadsStore } from "@/stores/leadsStore";
import { useChatStore } from "@/stores/chatStore";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { MessageSquare, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onToggleDetail: () => void;
  onOpenSidebar?: () => void;
  isMobile?: boolean;
}

export function ChatArea({ onToggleDetail, onOpenSidebar, isMobile }: Props) {
  const { selectedPhone, selectedLead } = useLeadsStore();
  const { conversations, pendingResponses, isTyping, loadingChat, sendMessage } = useChatStore();

  if (!selectedPhone || !selectedLead) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-4 text-muted-foreground">
        {isMobile && onOpenSidebar && (
          <Button variant="ghost" size="icon" onClick={onOpenSidebar} className="absolute top-4 left-4">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <MessageSquare className="h-12 w-12 text-text-xdim" />
        <p className="text-sm">Selecione um lead ou crie um novo</p>
      </div>
    );
  }

  const handleSend = (message: string) => {
    sendMessage(selectedPhone, message);
  };

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        lead={selectedLead}
        onToggleDetail={onToggleDetail}
        onOpenSidebar={onOpenSidebar}
        isMobile={isMobile}
      />
      <ChatMessages
        conversations={conversations}
        pendingResponses={pendingResponses.filter(
          (p) => p.lead_phone === selectedPhone
        )}
        isTyping={isTyping}
        loading={loadingChat}
      />
      <ChatInput onSend={handleSend} disabled={!selectedPhone} />
    </div>
  );
}
