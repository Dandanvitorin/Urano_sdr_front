import { create } from "zustand";
import { apiFetch } from "@/api/client";
import type { AnalyticsData } from "@/types";

interface AnalyticsState {
  data: AnalyticsData | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  data: null,
  loading: false,

  refresh: async () => {
    set({ loading: true });
    try {
      const data = await apiFetch<AnalyticsData>("/api/analytics");
      set({ data });
    } catch {
      /* ignore */
    } finally {
      set({ loading: false });
    }
  },
}));
