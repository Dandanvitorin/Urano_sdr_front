import { Radio, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPhone } from "@/lib/constants";
import type { Channel } from "@/types";

interface Props {
  channel: Channel;
  onDelete: (id: string) => void;
}

export function ChannelCard({ channel, onDelete }: Props) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="font-medium text-sm">{channel.name}</p>
            <p className="text-xs text-muted-foreground">{formatPhone(channel.phone_number)}</p>
          </div>
        </div>
        <Badge variant={channel.is_active ? "default" : "secondary"} className="text-xs">
          {channel.is_active ? "Ativo" : "Inativo"}
        </Badge>
      </div>

      {channel.crm_channel_id && (
        <p className="text-xs text-muted-foreground">
          CRM ID: <span className="font-mono">{channel.crm_channel_id}</span>
        </p>
      )}

      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(channel.id)}
          className="text-destructive hover:text-destructive h-8"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          Excluir
        </Button>
      </div>
    </div>
  );
}
