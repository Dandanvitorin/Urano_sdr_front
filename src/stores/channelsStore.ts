import { create } from "zustand";
import { apiFetch } from "@/api/client";
import type { Channel } from "@/types";

interface ChannelsState {
  channels: Channel[];
  loading: boolean;
  syncing: boolean;
  refresh: () => Promise<void>;
  createChannel: (data: { name: string; phone_number: string; crm_channel_id?: string }) => Promise<void>;
  updateChannel: (id: string, data: Partial<Channel>) => Promise<void>;
  deleteChannel: (id: string) => Promise<void>;
  syncChannels: () => Promise<{ synced: number }>;
}

export const useChannelsStore = create<ChannelsState>((set, get) => ({
  channels: [],
  loading: false,
  syncing: false,

  refresh: async () => {
    set({ loading: true });
    try {
      const channels = await apiFetch<Channel[]>("/api/channels");
      set({ channels });
    } finally {
      set({ loading: false });
    }
  },

  createChannel: async (data) => {
    await apiFetch("/api/channels", {
      method: "POST",
      body: JSON.stringify(data),
    });
    await get().refresh();
  },

  updateChannel: async (id, data) => {
    await apiFetch(`/api/channels/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    await get().refresh();
  },

  deleteChannel: async (id) => {
    await apiFetch(`/api/channels/${id}`, { method: "DELETE" });
    await get().refresh();
  },

  syncChannels: async () => {
    set({ syncing: true });
    try {
      const result = await apiFetch<{ synced: number }>("/api/channels/sync", {
        method: "POST",
      });
      await get().refresh();
      return result;
    } finally {
      set({ syncing: false });
    }
  },
}));
