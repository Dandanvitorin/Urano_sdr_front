import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLeadsStore } from "@/stores/leadsStore";
import { LeadCard } from "@/components/leads/LeadCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { STATE_CONFIG } from "@/lib/constants";
import type { LeadState } from "@/types";

export default function LeadsPage() {
  const navigate = useNavigate();
  const { leads } = useLeadsStore();
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("all");

  const filteredLeads = useMemo(() => {
    const q = search.toLowerCase();
    return leads
      .filter((l) => {
        const matchesSearch =
          l.name.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          (l.company_name || "").toLowerCase().includes(q) ||
          (l.channel_name || "").toLowerCase().includes(q);
        const matchesState = stateFilter === "all" || l.state === stateFilter;
        return matchesSearch && matchesState;
      })
      .sort((a, b) => new Date(b.last_interaction).getTime() - new Date(a.last_interaction).getTime());
  }, [leads, search, stateFilter]);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Leads</h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone ou empresa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary border-border"
            />
          </div>
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="w-full sm:w-[200px] bg-secondary border-border">
              <SelectValue placeholder="Todos os estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os estados</SelectItem>
              {(Object.entries(STATE_CONFIG) as [LeadState, { label: string }][]).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {filteredLeads.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum lead encontrado
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredLeads.map((lead) => (
              <LeadCard
                key={lead.phone}
                lead={lead}
                onClick={() => navigate(`/app/conversations/${lead.phone}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
