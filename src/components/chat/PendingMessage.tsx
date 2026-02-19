import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Pencil, X } from "lucide-react";
import { StarRating } from "./StarRating";
import { EditResponseModal } from "@/components/modals/EditResponseModal";
import { RejectConfirmModal } from "@/components/modals/RejectConfirmModal";
import { useChatStore } from "@/stores/chatStore";
import { useLeadsStore } from "@/stores/leadsStore";
import { useChannelsStore } from "@/stores/channelsStore";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import type { PendingResponse } from "@/types";

interface Props {
  pending: PendingResponse;
}

const NO_CHANNEL_VALUE = "__none__";

export function PendingMessage({ pending }: Props) {
  const [rating, setRating] = useState(0);
  const [approvalReason, setApprovalReason] = useState("");
  const [channelId, setChannelId] = useState<string>(NO_CHANNEL_VALUE);
  const [showEdit, setShowEdit] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [approving, setApproving] = useState(false);
  const { reviewPending, refreshChat } = useChatStore();
  const { selectedPhone, refreshStats } = useLeadsStore();
  const { channels, refresh: refreshChannels } = useChannelsStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (channels.length === 0) refreshChannels();
  }, []);

  useEffect(() => {
    if (pending.lead_channel_id) {
      setChannelId(pending.lead_channel_id);
      return;
    }
    if (user?.default_channel_id) {
      setChannelId(user.default_channel_id);
    }
  }, [pending.lead_channel_id, user?.default_channel_id]);

  const time = format(new Date(pending.created_at), "HH:mm", { locale: ptBR });
  const defaultChannel = channels.find((c) => c.id === user?.default_channel_id);

  const handleApprove = async () => {
    setApproving(true);
    try {
      await reviewPending(pending.id, {
        action: "approve",
        rating: rating > 0 ? rating : undefined,
        approval_reason: approvalReason || undefined,
        channel_id: channelId === NO_CHANNEL_VALUE ? undefined : channelId,
      });
      if (selectedPhone) refreshChat(selectedPhone);
      refreshStats();
      toast.success("Resposta aprovada");
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setApproving(false);
    }
  };

  return (
    <>
      <div className="flex justify-start">
        <div className="message-bubble-pending">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-medium text-warning">Aguardando aprovação</span>
          </div>
          {pending.agent_used && (
            <span className="text-[10px] text-primary font-medium block mb-1">
              {pending.agent_used}
            </span>
          )}
          <p className="text-sm whitespace-pre-wrap">{pending.ai_response}</p>
          <span className="text-[10px] text-text-xdim mt-1 block">{time}</span>

          {/* Star rating */}
          <div className="mt-2">
            <StarRating value={rating} onChange={setRating} />
          </div>

          {/* Approval reason */}
          <div className="mt-1.5">
            <Textarea
              value={approvalReason}
              onChange={(e) => setApprovalReason(e.target.value)}
              rows={2}
              placeholder="Por que essa resposta é boa? (opcional)"
              className="bg-secondary border-border text-xs resize-none"
            />
          </div>

          {/* Channel select */}
          {channels.length > 0 && (
            <div className="mt-1.5">
              <Select value={channelId} onValueChange={setChannelId}>
                <SelectTrigger className="bg-secondary border-border text-xs h-7">
                  <SelectValue placeholder="Canal de envio (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CHANNEL_VALUE}>Nenhum</SelectItem>
                  {defaultChannel && (
                    <SelectItem value={defaultChannel.id}>
                      Meu canal padrão ({defaultChannel.name})
                    </SelectItem>
                  )}
                  {channels.filter((c) => c.is_active && c.id !== defaultChannel?.id).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
            <Button
              size="sm"
              variant="success"
              className="h-7 text-xs"
              onClick={handleApprove}
              disabled={approving}
            >
              <Check className="h-3 w-3 mr-1" />
              {approving ? "..." : "Aprovar"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => setShowEdit(true)}
            >
              <Pencil className="h-3 w-3 mr-1" />
              Editar
            </Button>
            <Button
              size="sm"
              variant="ghost-destructive"
              className="h-7 text-xs"
              onClick={() => setShowReject(true)}
            >
              <X className="h-3 w-3 mr-1" />
              Rejeitar
            </Button>
          </div>
        </div>
      </div>

      <EditResponseModal
        open={showEdit}
        onOpenChange={setShowEdit}
        pending={pending}
      />
      <RejectConfirmModal
        open={showReject}
        onOpenChange={setShowReject}
        pending={pending}
      />
    </>
  );
}
