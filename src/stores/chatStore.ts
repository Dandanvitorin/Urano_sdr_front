import { create } from "zustand";
import { apiFetch } from "@/api/client";
import type { ConversationMessage, PendingResponse, ReviewPayload } from "@/types";

interface ChatState {
  conversations: ConversationMessage[];
  pendingResponses: PendingResponse[];
  isTyping: boolean;
  loadingChat: boolean;
  setTyping: (v: boolean) => void;
  refreshChat: (phone: string) => Promise<void>;
  refreshPending: (phone?: string) => Promise<void>;
  refreshAllPending: () => Promise<void>;
  sendMessage: (phone: string, message: string) => Promise<void>;
  reviewPending: (pendingId: string, payload: ReviewPayload) => Promise<void>;
  addMessage: (msg: ConversationMessage) => void;
  addPending: (p: PendingResponse) => void;
  updatePendingStatus: (pendingId: string, status: PendingResponse["status"]) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  pendingResponses: [],
  isTyping: false,
  loadingChat: false,

  setTyping: (v) => set({ isTyping: v }),

  clearChat: () => set({ conversations: [], pendingResponses: [], isTyping: false }),

  refreshChat: async (phone) => {
    set({ loadingChat: true });
    try {
      const conversations = await apiFetch<ConversationMessage[]>(`/api/leads/${phone}/conversations`);
      set({ conversations });
    } finally {
      set({ loadingChat: false });
    }
  },

  refreshPending: async (phone?: string) => {
    try {
      const query = phone
        ? `?lead_phone=${encodeURIComponent(phone)}&status=pending`
        : "?status=pending";
      const pendingResponses = await apiFetch<PendingResponse[]>(`/api/pending${query}`);
      set({ pendingResponses });
    } catch { /* ignore */ }
  },

  refreshAllPending: async () => {
    try {
      const all = await apiFetch<PendingResponse[]>("/api/pending?status=pending");
      set((s) => {
        // Merge: keep any pending responses already in state, add new ones from DB
        const existing = new Map(s.pendingResponses.map((p) => [p.id, p]));
        for (const p of all) {
          existing.set(p.id, p);
        }
        return { pendingResponses: Array.from(existing.values()) };
      });
    } catch { /* ignore */ }
  },

  sendMessage: async (phone, message) => {
    set({ isTyping: true });
    try {
      await apiFetch("/api/messages", {
        method: "POST",
        body: JSON.stringify({ phone, message }),
      });
      // Add user message locally
      get().addMessage({
        sender: "user",
        message,
        agent_name: "",
        timestamp: new Date().toISOString(),
      });
    } catch {
      set({ isTyping: false });
    }
  },

  reviewPending: async (pendingId, payload) => {
    await apiFetch(`/api/pending/${pendingId}/review`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    // Update local state
    if (payload.action === "reject") {
      get().updatePendingStatus(pendingId, "rejected");
    } else {
      // Remove from pending, it'll appear as a regular message after refresh
      set((s) => ({
        pendingResponses: s.pendingResponses.filter((p) => p.id !== pendingId),
      }));
    }
  },

  addMessage: (msg) => set((s) => ({ conversations: [...s.conversations, msg] })),

  addPending: (p) => set((s) => ({
    pendingResponses: [...s.pendingResponses.filter((x) => x.id !== p.id), p],
  })),

  updatePendingStatus: (pendingId, status) => set((s) => ({
    pendingResponses: s.pendingResponses.map((p) =>
      p.id === pendingId ? { ...p, status } : p
    ),
  })),
}));
