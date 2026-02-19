import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { PendingMessage } from "./PendingMessage";
import { RejectedMessage } from "./RejectedMessage";
import { TypingIndicator } from "./TypingIndicator";
import { Skeleton } from "@/components/ui/skeleton";
import type { ConversationMessage, PendingResponse } from "@/types";

interface Props {
  conversations: ConversationMessage[];
  pendingResponses: PendingResponse[];
  isTyping: boolean;
  loading: boolean;
}

export function ChatMessages({ conversations, pendingResponses, isTyping, loading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, pendingResponses, isTyping]);

  if (loading) {
    return (
      <div className="flex-1 p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
            <Skeleton className={`h-12 ${i % 2 === 0 ? "w-[60%]" : "w-[45%]"} rounded-2xl`} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-3">
        {conversations.map((msg, i) => (
          <MessageBubble key={`${msg.timestamp}-${i}`} message={msg} />
        ))}

        {pendingResponses.map((p) =>
          p.status === "rejected" ? (
            <RejectedMessage key={p.id} pending={p} />
          ) : p.status === "pending" ? (
            <PendingMessage key={p.id} pending={p} />
          ) : null
        )}

        {isTyping && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
