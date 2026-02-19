import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search as SearchIcon } from "lucide-react";
import { LeadItem } from "./LeadItem";
import { NewLeadModal } from "./NewLeadModal";
import { useChatStore } from "@/stores/chatStore";
import { useChannelsStore } from "@/stores/channelsStore";
import { useAuthStore } from "@/stores/authStore";
import { apiFetch } from "@/api/client";
import { toast } from "sonner";
import type { Lead } from "@/types";

interface Props {
  leads: Lead[];
  selectedPhone: string | null;
  onSelectLead: (phone: string) => void;
}

export function LeadList({ leads, selectedPhone, onSelectLead }: Props) {
  const [search, setSearch] = useState("");
  const [showNewLead, setShowNewLead] = useState(false);
  const [myDefaultChannel, setMyDefaultChannel] = useState("__none__");
  const { pendingResponses } = useChatStore();
  const { channels, refresh: refreshChannels } = useChannelsStore();
  const { user, setUser } = useAuthStore();

  const pendingPhones = useMemo(
    () => new Set(pendingResponses.filter((p) => p.status === "pending").map((p) => p.lead_phone)),
    [pendingResponses]
  );

  const filteredLeads = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        (l.company_name || "").toLowerCase().includes(q) ||
        (l.channel_name || "").toLowerCase().includes(q)
    );
    // Sort: pending first, then by last_interaction desc
    return filtered.sort((a, b) => {
      const aPending = pendingPhones.has(a.phone) ? 1 : 0;
      const bPending = pendingPhones.has(b.phone) ? 1 : 0;
      if (aPending !== bPending) return bPending - aPending;
      return new Date(b.last_interaction).getTime() - new Date(a.last_interaction).getTime();
    });
  }, [leads, search, pendingPhones]);

  useEffect(() => {
    refreshChannels();
  }, [refreshChannels]);

  useEffect(() => {
    setMyDefaultChannel(user?.default_channel_id || "__none__");
  }, [user?.default_channel_id]);

  const saveMyDefaultChannel = async () => {
    try {
      const selected = myDefaultChannel === "__none__" ? null : myDefaultChannel;
      await apiFetch("/api/users/me/default-channel", {
        method: "PUT",
        body: JSON.stringify({ channel_id: selected }),
      });
      if (user) {
        setUser({ ...user, default_channel_id: selected });
      }
      toast.success("Canal padrão salvo");
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search + New Lead */}
      <div className="p-3 space-y-2">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border h-9 text-sm"
          />
        </div>
        <Button
          onClick={() => setShowNewLead(true)}
          className="w-full h-9 text-sm"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Novo Lead
        </Button>
        <div className="pt-1">
          <p className="text-[11px] text-muted-foreground mb-1">Meu canal padrão</p>
          <div className="flex items-center gap-2">
            <Select value={myDefaultChannel} onValueChange={setMyDefaultChannel}>
              <SelectTrigger className="h-8 bg-secondary border-border text-xs">
                <SelectValue placeholder="Sem padrão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sem padrão</SelectItem>
                {channels.filter((c) => c.is_active).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-8" onClick={saveMyDefaultChannel}>
              Salvar
            </Button>
          </div>
        </div>
      </div>

      {/* Lead list */}
      <div className="flex-1 overflow-y-auto">
        {filteredLeads.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Nenhum lead encontrado
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <LeadItem
              key={lead.phone}
              lead={lead}
              isSelected={lead.phone === selectedPhone}
              hasPending={pendingPhones.has(lead.phone)}
              onClick={() => onSelectLead(lead.phone)}
            />
          ))
        )}
      </div>

      <NewLeadModal open={showNewLead} onOpenChange={setShowNewLead} />
    </div>
  );
}
