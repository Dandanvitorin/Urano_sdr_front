import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import {
  MessageSquare, Users, BarChart3, Radio, Plug, LogOut,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarRail,
  SidebarGroup, SidebarGroupContent,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { label: "Conversas", icon: MessageSquare, path: "/app/conversations", adminOnly: false },
  { label: "Leads", icon: Users, path: "/app/leads", adminOnly: false },
  { label: "Relatorios", icon: BarChart3, path: "/app/reports", adminOnly: false },
  { label: "Canais", icon: Radio, path: "/app/channels", adminOnly: true },
  { label: "Integracoes", icon: Plug, path: "/app/integrations", adminOnly: true },
  { label: "Equipe", icon: Users, path: "/app/team", adminOnly: true },
];

export function NavSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || user?.role === "admin"
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-sm">U</span>
          </div>
          <span className="urano-logo text-lg truncate group-data-[collapsible=icon]:hidden">
            Urano SDR
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.label}
                      onClick={() => navigate(item.path)}
                      className="gap-3"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-border">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-xs font-medium shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0 group-data-[collapsible=icon]:hidden"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
