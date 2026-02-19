import { useLeadsStore } from "@/stores/leadsStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Clock, Bell, UserX, Trash2 } from "lucide-react";
import { getStateStyle, formatCurrency, getInitials } from "@/lib/constants";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiFetch } from "@/api/client";
import { toast } from "sonner";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  onClose: () => void;
}

export function LeadDetail({ onClose }: Props) {
  const { selectedLead: lead, refreshSelectedLead, refreshLeads, refreshStats, selectLead } = useLeadsStore();
  const [followupLoading, setFollowupLoading] = useState(false);
  const [noshowLoading, setNoshowLoading] = useState(false);
  const [nudgeMin, setNudgeMin] = useState("10");
  const [followupMin, setFollowupMin] = useState("1440");

  if (!lead) return null;

  const { label, classes } = getStateStyle(lead.state);
  const initials = getInitials(lead.name);

  const handleFollowup = async () => {
    setFollowupLoading(true);
    try {
      await apiFetch(`/api/simulate/followup/${lead.phone}`, { method: "POST" });
      toast.success("Follow-up simulado");
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setFollowupLoading(false);
    }
  };

  const handleNoshow = async () => {
    setNoshowLoading(true);
    try {
      await apiFetch(`/api/simulate/noshow/${lead.phone}`, { method: "POST" });
      toast.success("No-show simulado");
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setNoshowLoading(false);
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

  const handleSetTimeouts = async () => {
    try {
      await apiFetch(`/api/simulate/set-timeouts?nudge_minutes=${nudgeMin}&followup_minutes=${followupMin}`, { method: "POST" });
      toast.success("Timeouts atualizados");
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center text-sm font-medium">
            {initials}
          </div>
          <div>
            <div className="font-medium text-sm">{lead.name}</div>
            <Badge variant="outline" className={`text-[10px] mt-0.5 ${classes}`}>
              {label}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="details" className="flex-1 flex flex-col">
        <TabsList className="bg-transparent border-b border-border rounded-none justify-start px-4 h-auto">
          <TabsTrigger value="details" className="text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-primary">Detalhes</TabsTrigger>
          <TabsTrigger value="tools" className="text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-primary">Ferramentas</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="flex-1 overflow-y-auto p-4 space-y-4 mt-0">
          <Section title="Lead">
            <InfoRow label="Telefone" value={lead.phone} />
            <InfoRow label="Empresa" value={lead.company_name} />
            <InfoRow label="Canal" value={lead.channel_name} />
            <InfoRow label="Email" value={lead.email} />
            <InfoRow label="Plano" value={lead.product_plan === "pro_max" ? "Pro Max" : lead.product_plan === "elite" ? "Elite" : "—"} />
            <InfoRow label="Segmento" value={lead.business_segment} />
            <InfoRow label="Qualificado" value={lead.is_qualified ? "Sim" : "Não"} highlight={lead.is_qualified ? "success" : undefined} />
          </Section>

          <Section title="Qualificação">
            <InfoRow label="PJ?" value={lead.is_pj == null ? "—" : lead.is_pj ? "Sim" : "Não"} />
            <InfoRow label="Funcionários" value={lead.employee_count?.toString()} />
            <InfoRow label="Faturamento" value={formatCurrency(lead.monthly_revenue)} />
            <InfoRow label="Decisor?" value={lead.is_decision_maker == null ? "—" : lead.is_decision_maker ? "Sim" : "Não"} />
            <InfoRow label="Ferramenta" value={lead.current_tool} />
          </Section>

          <Section title="Timing">
            <InfoRow label="Criado em" value={format(new Date(lead.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })} />
            <InfoRow label="Última interação" value={formatDistanceToNow(new Date(lead.last_interaction), { addSuffix: true, locale: ptBR })} />
            <InfoRow label="Follow-ups" value={lead.followup_count?.toString() || "0"} />
          </Section>
        </TabsContent>

        <TabsContent value="tools" className="flex-1 overflow-y-auto p-4 space-y-3 mt-0">
          <Button variant="outline" className="w-full justify-start gap-2" onClick={handleFollowup} disabled={followupLoading}>
            <Bell className="h-4 w-4" />
            {followupLoading ? "Simulando..." : "Simular Follow-up"}
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2" onClick={handleNoshow} disabled={noshowLoading}>
            <UserX className="h-4 w-4" />
            {noshowLoading ? "Simulando..." : "Simular No-show"}
          </Button>

          <div className="pt-2 border-t border-border space-y-2">
            <Label className="text-xs text-muted-foreground">Timeouts</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-[10px] text-text-xdim">Cutucada (min)</Label>
                <Input value={nudgeMin} onChange={(e) => setNudgeMin(e.target.value)} className="bg-secondary border-border h-8 text-sm" />
              </div>
              <div className="flex-1">
                <Label className="text-[10px] text-text-xdim">Follow-up (min)</Label>
                <Input value={followupMin} onChange={(e) => setFollowupMin(e.target.value)} className="bg-secondary border-border h-8 text-sm" />
              </div>
            </div>
            <Button variant="secondary" size="sm" className="w-full" onClick={handleSetTimeouts}>
              <Clock className="h-3 w-3 mr-1" /> Aplicar
            </Button>
          </div>

          <div className="pt-2 border-t border-border">
            <Button variant="ghost-destructive" className="w-full justify-start gap-2" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
              Deletar Lead
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{title}</h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value?: string | null; highlight?: string }) {
  const colorCls = highlight === "success" ? "text-success" : "text-foreground";
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${colorCls}`}>{value || "—"}</span>
    </div>
  );
}
