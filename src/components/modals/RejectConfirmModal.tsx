import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/chat/StarRating";
import { useChatStore } from "@/stores/chatStore";
import { useLeadsStore } from "@/stores/leadsStore";
import { toast } from "sonner";
import type { PendingResponse } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  pending: PendingResponse;
}

export function RejectConfirmModal({ open, onOpenChange, pending }: Props) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [idealResponse, setIdealResponse] = useState("");
  const [rating, setRating] = useState(1);
  const [loading, setLoading] = useState(false);
  const { reviewPending } = useChatStore();
  const { refreshStats } = useLeadsStore();

  const handleReject = async () => {
    setLoading(true);
    try {
      await reviewPending(pending.id, {
        action: "reject",
        rating,
        rejection_reason: rejectionReason || undefined,
        ideal_response: idealResponse || undefined,
      });
      refreshStats();
      toast.info("Resposta rejeitada");
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar Rejeição</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Rating</label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Por que rejeitou? (opcional)</label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              placeholder="Motivo da rejeição..."
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Como deveria ter respondido? (opcional)</label>
            <Textarea
              value={idealResponse}
              onChange={(e) => setIdealResponse(e.target.value)}
              rows={3}
              placeholder="A resposta ideal seria..."
              className="bg-secondary border-border"
            />
          </div>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Rejeitando..." : "Confirmar Rejeição"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
