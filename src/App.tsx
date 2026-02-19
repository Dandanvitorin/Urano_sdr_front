import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import LoginPage from "./pages/LoginPage";
import ConversationsPage from "./pages/ConversationsPage";
import LeadsPage from "./pages/LeadsPage";
import ReportsPage from "./pages/ReportsPage";
import ChannelsPage from "./pages/ChannelsPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import TeamPage from "./pages/TeamPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/conversations" replace />} />
            <Route path="conversations" element={<ConversationsPage />} />
            <Route path="conversations/:phone" element={<ConversationsPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="channels" element={<ChannelsPage />} />
            <Route path="integrations" element={<IntegrationsPage />} />
            <Route path="team" element={<TeamPage />} />
          </Route>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
