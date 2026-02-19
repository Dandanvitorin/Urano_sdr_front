import { create } from "zustand";
import { apiFetch } from "@/api/client";
import type { Lead, Stats } from "@/types";

interface LeadsState {
  leads: Lead[];
  selectedPhone: string | null;
  selectedLead: Lead | null;
  stats: Stats | null;
  loading: boolean;
  selectLead: (phone: string | null) => void;
  refreshLeads: () => Promise<void>;
  refreshSelectedLead: () => Promise<void>;
  refreshStats: () => Promise<void>;
  removeLead: (phone: string) => void;
  updateLeadInList: (phone: string) => Promise<void>;
}

export const useLeadsStore = create<LeadsState>((set, get) => ({
  leads: [],
  selectedPhone: null,
  selectedLead: null,
  stats: null,
  loading: false,

  selectLead: async (phone) => {
    set({ selectedPhone: phone, selectedLead: null });
    if (phone) {
      try {
        const lead = await apiFetch<Lead>(`/api/leads/${phone}`);
        set({ selectedLead: lead });
      } catch { /* toast handled globally */ }
    }
  },

  refreshLeads: async () => {
    set({ loading: true });
    try {
      const leads = await apiFetch<Lead[]>("/api/leads?limit=200");
      set({ leads });
    } finally {
      set({ loading: false });
    }
  },

  refreshSelectedLead: async () => {
    const { selectedPhone } = get();
    if (!selectedPhone) return;
    try {
      const lead = await apiFetch<Lead>(`/api/leads/${selectedPhone}`);
      set({ selectedLead: lead });
    } catch { /* ignore */ }
  },

  refreshStats: async () => {
    try {
      const stats = await apiFetch<Stats>("/api/stats");
      set({ stats });
    } catch { /* ignore */ }
  },

  removeLead: (phone) => {
    set((s) => ({
      leads: s.leads.filter((l) => l.phone !== phone),
      selectedPhone: s.selectedPhone === phone ? null : s.selectedPhone,
      selectedLead: s.selectedPhone === phone ? null : s.selectedLead,
    }));
  },

  updateLeadInList: async (phone) => {
    try {
      const updated = await apiFetch<Lead>(`/api/leads/${phone}`);
      set((s) => ({
        leads: s.leads.map((l) => (l.phone === phone ? { ...l, ...updated } : l)),
        selectedLead: s.selectedPhone === phone ? updated : s.selectedLead,
      }));
    } catch { /* ignore */ }
  },
}));
