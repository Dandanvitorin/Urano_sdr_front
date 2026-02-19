import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, UserX, Trash2, Info, Menu } from "lucide-react";
import { getStateStyle, getInitials } from "@/lib/constants";
import { apiFetch } from "@/api/client";
import { useLeadsStore } from "@/stores/leadsStore";
import { toast } from "sonner";
import type { Lead } from "@/types";

interface Props {
  lead: Lead;
  onToggleDetail: () => void;
  onOpenSidebar?: () => void;
  isMobile?: boolean;
}

export function ChatHeader({ lead, onToggleDetail, onOpenSidebar, isMobile }: Props) {
  const { label, classes } = getStateStyle(lead.state);
  const initials = getInitials(lead.name);
  const { refreshLeads, refreshStats, selectLead } = useLeadsStore();

  const handleFollowup = async () => {
    try {
      await apiFetch(`/api/simulate/followup/${lead.phone}`, { method: "POST" });
      toast.success("Follow-up simulado");
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  const handleNoshow = async () => {
    try {
      await apiFetch(`/api/simulate/noshow/${lead.phone}`, { method: "POST" });
      toast.success("No-show simulado");
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja deletar este lead?")) return;
    try {
      await apiFetch(`/api/leads/${lead.phone}`, { method: "DELETE" });
      toast.success("Lead deletado");
      selectLead(null);
      refreshLeads();
      refreshStats();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="h-14 min-h-[56px] border-b border-border flex items-center px-4 gap-3 bg-card">
      {isMobile && onOpenSidebar && (
        <Button variant="ghost" size="icon" onClick={onOpenSidebar} className="text-muted-foreground mr-1">
          <Menu className="h-5 w-5" />
        </Button>
      )}

      <div className="w-9 h-9 rounded-full bg-surface-3 flex items-center justify-center text-xs font-medium shrink-0">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{lead.name}</div>
        <Badge variant="outline" className={`text-[10px] ${classes}`}>{label}</Badge>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={handleFollowup} title="Simular Follow-up" className="text-muted-foreground hover:text-warning">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleNoshow} title="Simular No-show" className="text-muted-foreground hover:text-info">
          <UserX className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDelete} title="Deletar Lead" className="text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onToggleDetail} title="Detalhes" className="text-muted-foreground hover:text-primary">
          <Info className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
