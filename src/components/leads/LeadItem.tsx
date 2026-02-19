import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getInitials, getStateStyle } from "@/lib/constants";
import type { Lead } from "@/types";

interface Props {
  lead: Lead;
  isSelected: boolean;
  hasPending: boolean;
  onClick: () => void;
}

export function LeadItem({ lead, isSelected, hasPending, onClick }: Props) {
  const { label, Icon } = getStateStyle(lead.state);
  const initials = getInitials(lead.name);
  const timeAgo = lead.last_interaction
    ? formatDistanceToNow(new Date(lead.last_interaction), { addSuffix: true, locale: ptBR })
    : "";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-3 flex items-start gap-3 transition-all duration-150 hover:bg-secondary/60 ${
        isSelected ? "lead-item-active" : ""
      }`}
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center text-sm font-medium text-foreground shrink-0">
        {initials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm text-foreground truncate">{lead.name}</span>
          <span className="text-xs text-text-xdim ml-2 shrink-0">{timeAgo}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Icon className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground truncate">
            {label}
            {lead.company_name ? ` · ${lead.company_name}` : ""}
            {lead.channel_name ? ` · ${lead.channel_name}` : ""}
          </span>
        </div>
      </div>

      {/* Pending dot */}
      {hasPending && (
        <div className="mt-2">
          <div className="pending-dot" />
        </div>
      )}
    </button>
  );
}
