import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "@/api/client";
import { useLeadsStore } from "@/stores/leadsStore";
import { useChannelsStore } from "@/stores/channelsStore";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function NewLeadModal({ open, onOpenChange }: Props) {
  const [form, setForm] = useState({
    phone: "",
    name: "",
    email: "",
    company_name: "",
    product_plan: "",
    business_segment: "",
    channel_id: "",
  });
  const [loading, setLoading] = useState(false);
  const { refreshLeads, refreshStats } = useLeadsStore();
  const { channels, refresh: refreshChannels } = useChannelsStore();
  const { user } = useAuthStore();
  const activeChannels = useMemo(() => channels.filter((c) => c.is_active), [channels]);

  useEffect(() => {
    if (!open) return;
    refreshChannels();
  }, [open, refreshChannels]);

  useEffect(() => {
    if (!open) return;
    setForm((prev) => ({
      ...prev,
      channel_id: user?.default_channel_id || "",
    }));
  }, [open, user?.default_channel_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone || !form.name) return;
    setLoading(true);
    try {
      await apiFetch("/api/leads", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          product_plan: form.product_plan || undefined,
          channel_id: form.channel_id || undefined,
        }),
      });
      toast.success("Lead criado com sucesso!");
      refreshLeads();
      refreshStats();
      onOpenChange(false);
      setForm({
        phone: "",
        name: "",
        email: "",
        company_name: "",
        product_plan: "",
        business_segment: "",
        channel_id: user?.default_channel_id || "",
      });
    } catch (err: unknown) {
      toast.error("Erro ao criar lead", { description: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Telefone *</Label>
            <Input
              placeholder="+5511999999999"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              required
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Nome *</Label>
            <Input
              placeholder="Nome do lead"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input
              placeholder="email@exemplo.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Empresa</Label>
            <Input
              placeholder="Nome da empresa"
              value={form.company_name}
              onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Plano</Label>
            <Select
              value={form.product_plan}
              onValueChange={(v) => setForm((f) => ({ ...f, product_plan: v }))}
            >
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pro_max">Pro Max</SelectItem>
                <SelectItem value="elite">Elite</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Segmento</Label>
            <Input
              placeholder="Ex: Tecnologia"
              value={form.business_segment}
              onChange={(e) => setForm((f) => ({ ...f, business_segment: e.target.value }))}
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Canal</Label>
            <Select
              value={form.channel_id || "__auto__"}
              onValueChange={(v) => setForm((f) => ({ ...f, channel_id: v === "__auto__" ? "" : v }))}
            >
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Auto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__auto__">Auto</SelectItem>
                {activeChannels.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Criando..." : "Criar Lead"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
