import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check } from "lucide-react";
import type { ConversationMessage } from "@/types";

interface Props {
  message: ConversationMessage;
}

export function MessageBubble({ message }: Props) {
  const time = format(new Date(message.timestamp), "HH:mm", { locale: ptBR });

  if (message.sender === "system") {
    return (
      <div className="flex justify-center">
        <div className="message-bubble-system">
          <p className="text-xs">{message.message}</p>
          <span className="text-[10px] text-text-xdim mt-1 block">{time}</span>
        </div>
      </div>
    );
  }

  if (message.sender === "user") {
    return (
      <div className="flex justify-end">
        <div className="message-bubble-user">
          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
          <span className="text-[10px] opacity-70 mt-1 block text-right">{time}</span>
        </div>
      </div>
    );
  }

  // Agent
  return (
    <div className="flex justify-start">
      <div className="message-bubble-agent">
        {message.agent_name && (
          <span className="text-[10px] text-primary font-medium block mb-1">
            {message.agent_name}
          </span>
        )}
        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px] text-text-xdim">{time}</span>
          <Check className="h-3 w-3 text-text-xdim" />
        </div>
      </div>
    </div>
  );
}
