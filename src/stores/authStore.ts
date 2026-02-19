import { create } from "zustand";
import { apiFetch, setToken, clearToken } from "@/api/client";
import type { CurrentUser } from "@/types";

interface AuthState {
  token: string | null;
  user: CurrentUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  setLoading: (v: boolean) => void;
  setUser: (user: CurrentUser | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem("urano_token"),
  user: null,
  loading: false,

  setLoading: (v) => set({ loading: v }),
  setUser: (user) => set({ user }),

  login: async (email, password) => {
    set({ loading: true });
    try {
      const data = await apiFetch<{ access_token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(data.access_token);
      set({ token: data.access_token });
      await get().loadUser();
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    clearToken();
    set({ token: null, user: null });
  },

  loadUser: async () => {
    try {
      const user = await apiFetch<CurrentUser>("/api/auth/me");
      set({ user });
    } catch {
      get().logout();
    }
  },
}));
