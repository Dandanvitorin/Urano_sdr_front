import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StarRating } from "@/components/chat/StarRating";
import { useChatStore } from "@/stores/chatStore";
import { useLeadsStore } from "@/stores/leadsStore";
import { useChannelsStore } from "@/stores/channelsStore";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import type { PendingResponse } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  pending: PendingResponse;
}

const NO_CHANNEL_VALUE = "__none__";

export function EditResponseModal({ open, onOpenChange, pending }: Props) {
  const [text, setText] = useState(pending.ai_response);
  const [rating, setRating] = useState(0);
  const [approvalReason, setApprovalReason] = useState("");
  const [channelId, setChannelId] = useState<string>(NO_CHANNEL_VALUE);
  const [loading, setLoading] = useState(false);
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
  const defaultChannel = channels.find((c) => c.id === user?.default_channel_id);

  const handleSave = async () => {
    setLoading(true);
    try {
      await reviewPending(pending.id, {
        action: "edit",
        edited_response: text,
        rating: rating > 0 ? rating : undefined,
        approval_reason: approvalReason || undefined,
        channel_id: channelId === NO_CHANNEL_VALUE ? undefined : channelId,
      });
      if (selectedPhone) refreshChat(selectedPhone);
      refreshStats();
      toast.success("Resposta editada e aprovada");
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Resposta</DialogTitle>
        </DialogHeader>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className="bg-secondary border-border"
        />
        <div className="space-y-2">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Rating</label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div>
            <Textarea
              value={approvalReason}
              onChange={(e) => setApprovalReason(e.target.value)}
              rows={2}
              placeholder="Por que editou? (opcional)"
              className="bg-secondary border-border text-xs resize-none"
            />
          </div>
        </div>
        {channels.length > 0 && (
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Canal de envio</label>
            <Select value={channelId} onValueChange={setChannelId}>
              <SelectTrigger className="bg-secondary border-border text-xs">
                <SelectValue placeholder="Nenhum (opcional)" />
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
        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? "Salvando..." : "Salvar e Aprovar"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
