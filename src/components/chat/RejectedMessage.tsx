import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { PendingResponse } from "@/types";

interface Props {
  pending: PendingResponse;
}

export function RejectedMessage({ pending }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const time = format(new Date(pending.created_at), "HH:mm", { locale: ptBR });

  return (
    <div className="flex justify-start">
      <div className="message-bubble-rejected">
        <div className="flex items-center justify-between mb-1">
          <Badge variant="outline" className="text-[10px] bg-destructive/15 text-destructive border-destructive/30">
            Rejeitada
          </Badge>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="text-text-xdim hover:text-muted-foreground transition-colors"
          >
            {collapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </button>
        </div>
        {!collapsed && (
          <>
            {pending.agent_used && (
              <span className="text-[10px] text-muted-foreground font-medium block mb-1">
                {pending.agent_used}
              </span>
            )}
            <p className="text-sm whitespace-pre-wrap">{pending.ai_response}</p>
            <span className="text-[10px] text-text-xdim mt-1 block">{time}</span>
          </>
        )}
      </div>
    </div>
  );
}
