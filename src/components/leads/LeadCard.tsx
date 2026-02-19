import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getInitials, getStateStyle, formatPhone } from "@/lib/constants";
import { STATE_COLOR_MAP } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import type { Lead } from "@/types";

interface Props {
  lead: Lead;
  onClick: () => void;
}

export function LeadCard({ lead, onClick }: Props) {
  const { label, classes, Icon } = getStateStyle(lead.state);
  const initials = getInitials(lead.name);
  const timeAgo = lead.last_interaction
    ? formatDistanceToNow(new Date(lead.last_interaction), { addSuffix: true, locale: ptBR })
    : "";

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border border-border bg-card p-4 hover:bg-secondary/60 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center text-sm font-medium text-foreground shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground truncate">{lead.name}</p>
          <p className="text-xs text-muted-foreground truncate">{formatPhone(lead.phone)}</p>
          {lead.company_name && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{lead.company_name}</p>
          )}
          {lead.channel_name && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">Canal: {lead.channel_name}</p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <Badge variant="outline" className={`text-xs ${classes}`}>
          <Icon className="h-3 w-3 mr-1" />
          {label}
        </Badge>
        <span className="text-xs text-text-xdim">{timeAgo}</span>
      </div>
    </button>
  );
}
