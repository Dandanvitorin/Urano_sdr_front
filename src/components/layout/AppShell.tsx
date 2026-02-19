import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useLeadsStore } from "@/stores/leadsStore";
import { useChatStore } from "@/stores/chatStore";
import { useSSE } from "@/hooks/useSSE";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { NavSidebar } from "./NavSidebar";

export function AppShell() {
  const { user, loadUser, token } = useAuthStore();
  const { refreshLeads, refreshStats } = useLeadsStore();
  const { refreshAllPending } = useChatStore();

  useSSE();

  useEffect(() => {
    if (token && !user) loadUser();
  }, [token, user]);

  useEffect(() => {
    refreshLeads();
    refreshStats();
    refreshAllPending();
  }, []);

  return (
    <SidebarProvider>
      <NavSidebar />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
