import { useEffect, useState } from "react";
import { apiFetch } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Trash2 } from "lucide-react";
import { getInitials } from "@/lib/constants";
import { toast } from "sonner";
import type { Channel, TeamUser } from "@/types";

export function TeamList() {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [defaultChannelByUser, setDefaultChannelByUser] = useState<Record<string, string>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await apiFetch<TeamUser[]>("/api/users");
      setUsers(data);
      setDefaultChannelByUser(
        data.reduce<Record<string, string>>((acc, u) => {
          acc[u.user_id] = u.default_channel_id || "__none__";
          return acc;
        }, {})
      );
    } catch { /* ignore */ }
  };

  const fetchChannels = async () => {
    try {
      const data = await apiFetch<Channel[]>("/api/channels");
      setChannels(data.filter((c) => c.is_active));
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchUsers();
    fetchChannels();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify({ ...form, role: "seller" }),
      });
      toast.success("Vendedor adicionado!");
      setShowAdd(false);
      setForm({ name: "", email: "", password: "" });
      fetchUsers();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (userId: string) => {
    if (!confirm("Desativar este vendedor?")) return;
    try {
      await apiFetch(`/api/users/${userId}`, { method: "DELETE" });
      toast.success("Vendedor desativado");
      fetchUsers();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  const handleDefaultChannelSave = async (userId: string) => {
    try {
      const selected = defaultChannelByUser[userId] || "__none__";
      await apiFetch(`/api/users/${userId}/default-channel`, {
        method: "PUT",
        body: JSON.stringify({ channel_id: selected === "__none__" ? null : selected }),
      });
      toast.success("Canal padrão atualizado");
      fetchUsers();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="p-3 space-y-2">
      <Button onClick={() => setShowAdd(true)} className="w-full h-9 text-sm" size="sm">
        <UserPlus className="h-4 w-4 mr-1" />
        Novo Vendedor
      </Button>

      <div className="space-y-1">
        {users.map((u) => (
          <div key={u.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/60 transition-colors">
            <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-xs font-medium shrink-0">
              {getInitials(u.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{u.name}</div>
              <div className="text-xs text-muted-foreground truncate">{u.email}</div>
              <div className="mt-2 flex items-center gap-2">
                <Select
                  value={defaultChannelByUser[u.user_id] || "__none__"}
                  onValueChange={(v) => setDefaultChannelByUser((prev) => ({ ...prev, [u.user_id]: v }))}
                >
                  <SelectTrigger className="h-8 bg-secondary border-border text-xs min-w-[180px]">
                    <SelectValue placeholder="Canal padrão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sem padrão</SelectItem>
                    {channels.map((ch) => (
                      <SelectItem key={ch.id} value={ch.id}>
                        {ch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => handleDefaultChannelSave(u.user_id)}
                >
                  Salvar canal
                </Button>
              </div>
            </div>
            <Badge variant="outline" className={`text-[10px] ${u.role === "admin" ? "bg-primary/15 text-primary border-primary/30" : "bg-success/15 text-success border-success/30"}`}>
              {u.role}
            </Badge>
            {u.role === "seller" && (
              <Button variant="ghost" size="icon" onClick={() => handleDeactivate(u.user_id)} className="text-muted-foreground hover:text-destructive h-7 w-7">
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Vendedor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Nome</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required className="bg-secondary border-border" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required className="bg-secondary border-border" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Senha</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required className="bg-secondary border-border" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Criando..." : "Criar Vendedor"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
