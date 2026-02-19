import { useEffect, useRef, useCallback } from "react";
import { useSSEStore } from "@/stores/sseStore";
import { useLeadsStore } from "@/stores/leadsStore";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import type { PendingResponse, ConversationMessage, SSEEvent } from "@/types";
import { toast } from "sonner";

export function useSSE() {
  const token = useAuthStore((s) => s.token);
  const { connect, disconnect, eventSource, connected } = useSSEStore();
  const { selectedPhone, refreshLeads, removeLead, updateLeadInList, refreshStats } = useLeadsStore();
  const { addMessage, addPending, updatePendingStatus, setTyping, refreshChat, refreshPending } = useChatStore();
  const pollingRef = useRef<ReturnType<typeof setInterval>>();

  const handleEvent = useCallback(
    (data: SSEEvent) => {
      switch (data.type) {
        case "connected":
          break;

        case "pending_response": {
          const p = data as SSEEvent & { pending_id?: string; lead_id: string; lead_name: string; phone: string; user_message: string; ai_response: string; agent_used: string; lead_state: string };
          addPending({
            id: (p.pending_id || "") as string,
            lead_id: p.lead_id,
            lead_name: p.lead_name as string,
            lead_phone: p.phone,
            user_message: p.user_message as string,
            ai_response: p.ai_response as string,
            edited_response: null,
            agent_used: p.agent_used as string,
            lead_state: p.lead_state as string,
            status: "pending",
            reviewed_by: null,
            created_at: new Date().toISOString(),
            reviewed_at: null,
          });
          setTyping(false);
          toast.info("Resposta da IA gerada", { description: `Lead: ${p.lead_name || p.phone}` });
          refreshStats();
          break;
        }

        case "response_reviewed": {
          const d = data as SSEEvent & { pending_id: string; action: string; response?: string; phone?: string };
          if (d.action === "rejected") {
            updatePendingStatus(d.pending_id, "rejected");
          } else {
            // Remove approved/edited from pending list
            useChatStore.setState((s) => ({
              pendingResponses: s.pendingResponses.filter((p) => p.id !== d.pending_id),
            }));
            if (d.phone && d.phone === selectedPhone) {
              refreshChat(d.phone);
            }
          }
          refreshStats();
          break;
        }

        case "new_message": {
          const d = data as SSEEvent & { phone: string; sender: string; message: string; agent_used: string };
          if (d.phone === selectedPhone) {
            addMessage({
              sender: d.sender as ConversationMessage["sender"],
              message: d.message,
              agent_name: d.agent_used || "",
              timestamp: new Date().toISOString(),
            });
          }
          refreshLeads();
          break;
        }

        case "new_lead":
          refreshLeads();
          refreshStats();
          break;

        case "lead_deleted": {
          const d = data as SSEEvent & { phone: string };
          removeLead(d.phone);
          refreshStats();
          break;
        }

        case "lead_updated": {
          const d = data as SSEEvent & { phone: string };
          updateLeadInList(d.phone);
          refreshStats();
          break;
        }

        case "meeting_booked": {
          const d = data as SSEEvent & { phone: string; teams_join_url?: string };
          if (d.phone === selectedPhone) {
            addMessage({
              sender: "system",
              message: `Reunião agendada! ${d.teams_join_url ? `Link: ${d.teams_join_url}` : ""}`,
              agent_name: "system",
              timestamp: new Date().toISOString(),
            });
          }
          toast.success("Reunião agendada com sucesso!");
          refreshStats();
          break;
        }

        case "processing_error": {
          const d = data as SSEEvent & { phone: string; error: string };
          setTyping(false);
          if (d.phone === selectedPhone) {
            addMessage({
              sender: "system",
              message: `Erro: ${d.error}`,
              agent_name: "system",
              timestamp: new Date().toISOString(),
            });
          }
          toast.error("Erro no processamento", { description: d.error });
          break;
        }
      }
    },
    [selectedPhone, addMessage, addPending, updatePendingStatus, setTyping, refreshChat, refreshLeads, removeLead, updateLeadInList, refreshStats, refreshPending]
  );

  useEffect(() => {
    if (!token) return;
    connect(token);
    return () => disconnect();
  }, [token]);

  useEffect(() => {
    const es = eventSource;
    if (!es) return;

    const handler = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        handleEvent(data);
      } catch { /* ignore parse errors */ }
    };

    es.onmessage = handler;
    return () => { es.onmessage = null; };
  }, [eventSource, handleEvent]);

  // Polling fallback
  useEffect(() => {
    if (connected) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }

    if (!token) return;

    pollingRef.current = setInterval(() => {
      refreshLeads();
      if (selectedPhone) {
        refreshPending(selectedPhone);
      }
    }, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [connected, token, selectedPhone]);
}
