import { create } from "zustand";
import { getSSEUrl } from "@/api/client";

interface SSEState {
  connected: boolean;
  eventSource: EventSource | null;
  connect: (token: string) => void;
  disconnect: () => void;
}

export const useSSEStore = create<SSEState>((set, get) => ({
  connected: false,
  eventSource: null,

  connect: (token) => {
    const existing = get().eventSource;
    if (existing) existing.close();

    const es = new EventSource(getSSEUrl(token));

    es.onopen = () => set({ connected: true });

    es.onerror = () => {
      set({ connected: false });
      es.close();
      // Reconnect after 10s
      setTimeout(() => {
        const currentToken = localStorage.getItem("urano_token");
        if (currentToken) get().connect(currentToken);
      }, 10000);
    };

    set({ eventSource: es });
  },

  disconnect: () => {
    const es = get().eventSource;
    if (es) es.close();
    set({ connected: false, eventSource: null });
  },
}));
