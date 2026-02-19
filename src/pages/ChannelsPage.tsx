import { useEffect, useState } from "react";
import { useChannelsStore } from "@/stores/channelsStore";
import { ChannelCard } from "@/components/channels/ChannelCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function ChannelsPage() {
  const { channels, loading, syncing, refresh, createChannel, deleteChannel, syncChannels } = useChannelsStore();
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone_number: "", crm_channel_id: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = async () => {
    if (!form.name || !form.phone_number) {
      toast.error("Nome e telefone sao obrigatorios");
      return;
    }
    setSaving(true);
    try {
      await createChannel({
        name: form.name,
        phone_number: form.phone_number,
        crm_channel_id: form.crm_channel_id || undefined,
      });
      toast.success("Canal criado com sucesso");
      setShowCreate(false);
      setForm({ name: "", phone_number: "", crm_channel_id: "" });
    } catch (err) {
      toast.error("Erro ao criar canal", { description: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    try {
      const result = await syncChannels();
      toast.success(`${result.synced} canais sincronizados do CRM`);
    } catch (err) {
      toast.error("Erro ao sincronizar canais", { description: (err as Error).message });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteChannel(deleteId);
      toast.success("Canal excluido");
    } catch (err) {
      toast.error("Erro ao excluir canal", { description: (err as Error).message });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Canais WhatsApp</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSync} disabled={syncing}>
              {syncing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Sincronizar do CRM
            </Button>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Canal
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : channels.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum canal configurado
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map((ch) => (
              <ChannelCard key={ch.id} channel={ch} onDelete={setDeleteId} />
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Canal WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Nome</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Vendas Principal"
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Telefone</Label>
              <Input
                value={form.phone_number}
                onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
                placeholder="5511999999999"
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">CRM Channel ID (opcional)</Label>
              <Input
                value={form.crm_channel_id}
                onChange={(e) => setForm((f) => ({ ...f, crm_channel_id: e.target.value }))}
                placeholder="ID do canal no CRM"
                className="bg-secondary border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Criar Canal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir canal?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao nao pode ser desfeita. O canal sera removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
