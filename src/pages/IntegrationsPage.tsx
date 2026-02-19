import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/api/client";
import type { MicrosoftStatus, CRMConfig, TrelloConfig, TeamUser, UranoCRMSettings } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle, ExternalLink, Database } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

export default function IntegrationsPage() {
  const { user } = useAuthStore();
  // Microsoft state
  const [msStatus, setMsStatus] = useState<MicrosoftStatus | null>(null);
  const [msLoading, setMsLoading] = useState(true);
  const [msActionLoading, setMsActionLoading] = useState(false);

  // CRM state
  const [crmConfig, setCrmConfig] = useState<CRMConfig | null>(null);
  const [crmLoading, setCrmLoading] = useState(true);
  const [crmKey, setCrmKey] = useState("");
  const [crmEmail, setCrmEmail] = useState("");
  const [crmSaving, setCrmSaving] = useState(false);
  const [crmTesting, setCrmTesting] = useState(false);

  // Trello state
  const [trelloConfig, setTrelloConfig] = useState<TrelloConfig | null>(null);
  const [trelloLoading, setTrelloLoading] = useState(true);
  const [trelloSaving, setTrelloSaving] = useState(false);
  const [trelloTesting, setTrelloTesting] = useState(false);
  const [teamUsers, setTeamUsers] = useState<TeamUser[]>([]);
  const [trelloForm, setTrelloForm] = useState({
    trello_key: "",
    trello_token: "",
    allowed_board_ids: "",
    seller_id: "__none__",
    product_plan: "pro_max",
    is_active: true,
  });

  // CRM Settings state
  const [crmSettings, setCrmSettings] = useState<UranoCRMSettings | null>(null);
  const [crmSettingsLoading, setCrmSettingsLoading] = useState(false);
  const [crmSettingsSaving, setCrmSettingsSaving] = useState(false);
  const [settingsForm, setSettingsForm] = useState<Partial<UranoCRMSettings>>({});

  const fetchMsStatus = useCallback(async () => {
    try {
      const data = await apiFetch<MicrosoftStatus>("/api/integrations/microsoft/status");
      setMsStatus(data);
    } catch {
      setMsStatus(null);
    } finally {
      setMsLoading(false);
    }
  }, []);

  const fetchCrmConfig = useCallback(async () => {
    try {
      const data = await apiFetch<CRMConfig>("/api/integrations/crm/config");
      setCrmConfig(data);
      setCrmEmail(data.user_email || "");
    } catch {
      setCrmConfig(null);
    } finally {
      setCrmLoading(false);
    }
  }, []);

  const fetchCrmSettings = useCallback(async () => {
    setCrmSettingsLoading(true);
    try {
      const data = await apiFetch<UranoCRMSettings>("/api/integrations/crm/settings");
      setCrmSettings(data);
      setSettingsForm(data);
    } catch {
      setCrmSettings(null);
    } finally {
      setCrmSettingsLoading(false);
    }
  }, []);

  const fetchTeamUsers = useCallback(async () => {
    try {
      const users = await apiFetch<TeamUser[]>("/api/users");
      setTeamUsers(users.filter((u) => u.is_active));
    } catch {
      setTeamUsers([]);
    }
  }, []);

  const fetchTrelloConfig = useCallback(async () => {
    setTrelloLoading(true);
    try {
      const cfg = await apiFetch<TrelloConfig>("/api/integrations/trello/config");
      setTrelloConfig(cfg);
      setTrelloForm((prev) => ({
        ...prev,
        allowed_board_ids: cfg.allowed_board_ids || "",
        seller_id: cfg.seller_id || "__none__",
        product_plan: cfg.product_plan || "pro_max",
        is_active: cfg.is_active,
      }));
    } catch {
      setTrelloConfig(null);
    } finally {
      setTrelloLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role !== "admin") return;
    fetchMsStatus();
    fetchCrmConfig();
    fetchCrmSettings();
    fetchTrelloConfig();
    fetchTeamUsers();
  }, [user?.role, fetchMsStatus, fetchCrmConfig, fetchCrmSettings, fetchTrelloConfig, fetchTeamUsers]);

  if (!user) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto rounded-lg border border-border bg-card p-6">
          <h1 className="text-xl font-semibold">Integracoes</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Acesso restrito ao perfil administrador.
          </p>
        </div>
      </div>
    );
  }

  // Listen for OAuth popup postMessage
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "microsoft_connected") {
        toast.success("Outlook conectado!", { description: event.data.email });
        fetchMsStatus();
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [fetchMsStatus]);

  const handleMsConnect = async () => {
    setMsActionLoading(true);
    try {
      const data = await apiFetch<{ success: boolean; auth_url: string }>(
        "/api/integrations/microsoft/connect",
        { method: "POST" }
      );
      if (data.auth_url) {
        window.open(data.auth_url, "microsoft_oauth", "width=600,height=700");
      }
    } catch (err) {
      toast.error("Erro ao conectar", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    } finally {
      setMsActionLoading(false);
    }
  };

  const handleMsDisconnect = async () => {
    setMsActionLoading(true);
    try {
      await apiFetch("/api/integrations/microsoft/disconnect", { method: "POST" });
      toast.success("Outlook desconectado");
      fetchMsStatus();
    } catch (err) {
      toast.error("Erro ao desconectar", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    } finally {
      setMsActionLoading(false);
    }
  };

  const handleCrmSave = async () => {
    if (!crmKey.trim()) {
      toast.error("Informe a API key");
      return;
    }
    if (!crmEmail.trim()) {
      toast.error("Informe o email de login do CRM");
      return;
    }
    setCrmSaving(true);
    try {
      await apiFetch("/api/integrations/crm/config", {
        method: "POST",
        body: JSON.stringify({ api_key: crmKey, user_email: crmEmail }),
      });
      toast.success("API key salva com sucesso");
      setCrmKey("");
      fetchCrmConfig();
    } catch (err) {
      toast.error("Erro ao salvar", { description: (err as Error).message });
    } finally {
      setCrmSaving(false);
    }
  };

  const handleCrmTest = async () => {
    setCrmTesting(true);
    try {
      const data = await apiFetch<{ success: boolean; message: string }>(
        "/api/integrations/crm/test",
        { method: "POST" }
      );
      toast.success(data.message);
    } catch (err) {
      toast.error("Erro ao testar", { description: (err as Error).message });
    } finally {
      setCrmTesting(false);
    }
  };

  const handleCrmSettingsSave = async () => {
    setCrmSettingsSaving(true);
    try {
      await apiFetch("/api/integrations/crm/settings", {
        method: "POST",
        body: JSON.stringify(settingsForm),
      });
      toast.success("Configuracao CRM salva");
      fetchCrmSettings();
    } catch (err) {
      toast.error("Erro ao salvar configuracao", { description: (err as Error).message });
    } finally {
      setCrmSettingsSaving(false);
    }
  };

  const handleTrelloSave = async () => {
    setTrelloSaving(true);
    try {
      await apiFetch("/api/integrations/trello/config", {
        method: "POST",
        body: JSON.stringify({
          trello_key: trelloForm.trello_key || undefined,
          trello_token: trelloForm.trello_token || undefined,
          allowed_board_ids: trelloForm.allowed_board_ids || "",
          seller_id: trelloForm.seller_id === "__none__" ? null : trelloForm.seller_id,
          product_plan: trelloForm.product_plan,
          is_active: trelloForm.is_active,
        }),
      });
      toast.success("Configuracao Trello salva");
      setTrelloForm((prev) => ({ ...prev, trello_key: "", trello_token: "" }));
      fetchTrelloConfig();
    } catch (err) {
      toast.error("Erro ao salvar Trello", { description: (err as Error).message });
    } finally {
      setTrelloSaving(false);
    }
  };

  const handleTrelloTest = async () => {
    setTrelloTesting(true);
    try {
      const data = await apiFetch<{ success: boolean; message: string; username?: string; boards_count?: number }>(
        "/api/integrations/trello/test",
        { method: "POST" }
      );
      toast.success(data.message, {
        description: data.username ? `${data.username} • ${data.boards_count || 0} boards` : undefined,
      });
    } catch (err) {
      toast.error("Erro ao testar Trello", { description: (err as Error).message });
    } finally {
      setTrelloTesting(false);
    }
  };

  const updateSettingsField = (field: keyof UranoCRMSettings, value: string) => {
    if (field === "venda_meio" || field === "lead_estado" || field === "fila_observacoes_aceite") {
      setSettingsForm((prev) => ({ ...prev, [field]: value || null }));
      return;
    }
    const numValue = value === "" ? null : Number(value);
    setSettingsForm((prev) => ({ ...prev, [field]: numValue }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Integracoes</h1>

        <div className="space-y-6">
          {/* Urano CRM Card */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-primary" />
              <div>
                <h2 className="font-semibold">Urano CRM</h2>
                <p className="text-sm text-muted-foreground">Conecte ao CRM para sincronizar canais WhatsApp</p>
              </div>
            </div>

            {crmLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  {crmConfig?.configured ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500 font-medium">Configurado</span>
                      <span className="text-xs text-muted-foreground ml-2 font-mono">
                        {crmConfig.api_key_masked}
                      </span>
                      {crmConfig.source && (
                        <span className="text-xs text-muted-foreground ml-2">origem: {crmConfig.source}</span>
                      )}
                      {crmConfig.user_email && (
                        <span className="text-xs text-muted-foreground ml-2">{crmConfig.user_email}</span>
                      )}
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-muted-foreground">
                        API key nao configurada {crmConfig?.env_available ? "(env detectado)" : ""}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Nova API Key</Label>
                    <Input
                      type="password"
                      value={crmKey}
                      onChange={(e) => setCrmKey(e.target.value)}
                      placeholder="Cole a API key do CRM"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Email de login no CRM</Label>
                    <Input
                      type="email"
                      value={crmEmail}
                      onChange={(e) => setCrmEmail(e.target.value)}
                      placeholder="email@dominio.com"
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCrmSave} disabled={crmSaving} size="sm">
                    {crmSaving && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
                    Salvar
                  </Button>
                  {crmConfig?.configured && (
                    <Button onClick={handleCrmTest} disabled={crmTesting} variant="outline" size="sm">
                      {crmTesting && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
                      Testar Conexao
                    </Button>
                  )}
                </div>

                {/* CRM Settings - IDs configuráveis */}
                {crmConfig?.configured && (
                  <div className="border-t border-border pt-4 mt-4 space-y-3">
                    <h3 className="text-sm font-medium">IDs do CRM</h3>
                    {crmSettingsLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Produto Pro Max (ID)</Label>
                            <Input
                              type="number"
                              value={settingsForm.produto_pro_max ?? ""}
                              onChange={(e) => updateSettingsField("produto_pro_max", e.target.value)}
                              placeholder="ID do produto"
                              className="bg-secondary border-border"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Produto Elite (ID)</Label>
                            <Input
                              type="number"
                              value={settingsForm.produto_elite ?? ""}
                              onChange={(e) => updateSettingsField("produto_elite", e.target.value)}
                              placeholder="ID do produto"
                              className="bg-secondary border-border"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Origem (ID)</Label>
                            <Input
                              type="number"
                              value={settingsForm.origem ?? ""}
                              onChange={(e) => updateSettingsField("origem", e.target.value)}
                              placeholder="ID da origem"
                              className="bg-secondary border-border"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Oportunidade (ID)</Label>
                            <Input
                              type="number"
                              value={settingsForm.oportunidade_id ?? ""}
                              onChange={(e) => updateSettingsField("oportunidade_id", e.target.value)}
                              placeholder="ID da oportunidade"
                              className="bg-secondary border-border"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Fila (ID)</Label>
                            <Input
                              type="number"
                              value={settingsForm.fila_id ?? ""}
                              onChange={(e) => updateSettingsField("fila_id", e.target.value)}
                              placeholder="ID da fila"
                              className="bg-secondary border-border"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Lead Estado</Label>
                            <Input
                              value={settingsForm.lead_estado ?? ""}
                              onChange={(e) => updateSettingsField("lead_estado", e.target.value)}
                              placeholder="Estado inicial da oportunidade"
                              className="bg-secondary border-border"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs text-muted-foreground">Observacoes Aceite da Fila</Label>
                            <Input
                              value={settingsForm.fila_observacoes_aceite ?? ""}
                              onChange={(e) => updateSettingsField("fila_observacoes_aceite", e.target.value)}
                              placeholder="Texto enviado em fila_observacoes_aceite"
                              className="bg-secondary border-border"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Vendedor CRM (ID)</Label>
                            <Input
                              type="number"
                              value={settingsForm.vendedor_id ?? ""}
                              onChange={(e) => updateSettingsField("vendedor_id", e.target.value)}
                              placeholder="ID do vendedor"
                              className="bg-secondary border-border"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">SDR CRM (ID)</Label>
                            <Input
                              type="number"
                              value={settingsForm.sdr_id ?? ""}
                              onChange={(e) => updateSettingsField("sdr_id", e.target.value)}
                              placeholder="ID do SDR"
                              className="bg-secondary border-border"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Meio da Venda</Label>
                            <Select
                              value={settingsForm.venda_meio || "online"}
                              onValueChange={(v) => setSettingsForm((prev) => ({ ...prev, venda_meio: v }))}
                            >
                              <SelectTrigger className="bg-secondary border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="online">Online</SelectItem>
                                <SelectItem value="presencial">Presencial</SelectItem>
                                <SelectItem value="telefone">Telefone</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Contrato Escritorio (ID)</Label>
                            <Input
                              type="number"
                              value={settingsForm.contrato_escritorio_id ?? ""}
                              onChange={(e) => updateSettingsField("contrato_escritorio_id", e.target.value)}
                              placeholder="ID do contrato"
                              className="bg-secondary border-border"
                            />
                          </div>
                        </div>
                        <Button onClick={handleCrmSettingsSave} disabled={crmSettingsSaving} size="sm">
                          {crmSettingsSaving && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
                          Salvar Configuracao
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Trello Card */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-primary" />
              <div>
                <h2 className="font-semibold">Trello</h2>
                <p className="text-sm text-muted-foreground">Crie leads automaticos a partir de cards do Trello</p>
              </div>
            </div>

            {trelloLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  {trelloConfig?.configured ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500 font-medium">Configurado</span>
                      <span className="text-xs text-muted-foreground ml-2 font-mono">
                        {trelloConfig.trello_key_masked}
                      </span>
                      {trelloConfig.source && (
                        <span className="text-xs text-muted-foreground ml-2">origem: {trelloConfig.source}</span>
                      )}
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-muted-foreground">
                        Trello nao configurado {trelloConfig?.env_available ? "(env detectado)" : ""}
                      </span>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Trello Key (opcional ao editar)</Label>
                    <Input
                      value={trelloForm.trello_key}
                      onChange={(e) => setTrelloForm((f) => ({ ...f, trello_key: e.target.value }))}
                      placeholder="API key Trello"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Trello Token (opcional ao editar)</Label>
                    <Input
                      type="password"
                      value={trelloForm.trello_token}
                      onChange={(e) => setTrelloForm((f) => ({ ...f, trello_token: e.target.value }))}
                      placeholder="Token Trello"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">Board IDs permitidos (csv)</Label>
                    <Input
                      value={trelloForm.allowed_board_ids}
                      onChange={(e) => setTrelloForm((f) => ({ ...f, allowed_board_ids: e.target.value }))}
                      placeholder="6995c79e68f0ec83171e867b"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Vendedor destino</Label>
                    <Select
                      value={trelloForm.seller_id}
                      onValueChange={(v) => setTrelloForm((f) => ({ ...f, seller_id: v }))}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Auto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Auto</SelectItem>
                        {teamUsers.map((u) => (
                          <SelectItem key={u.user_id} value={u.user_id}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Plano padrao</Label>
                    <Select
                      value={trelloForm.product_plan}
                      onValueChange={(v) => setTrelloForm((f) => ({ ...f, product_plan: v }))}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pro_max">Pro Max</SelectItem>
                        <SelectItem value="elite">Elite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={trelloForm.is_active ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTrelloForm((f) => ({ ...f, is_active: !f.is_active }))}
                  >
                    {trelloForm.is_active ? "Ativo" : "Inativo"}
                  </Button>
                  <Button onClick={handleTrelloSave} disabled={trelloSaving} size="sm">
                    {trelloSaving && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
                    Salvar
                  </Button>
                  <Button onClick={handleTrelloTest} disabled={trelloTesting} variant="outline" size="sm">
                    {trelloTesting && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
                    Testar Trello
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Microsoft Outlook Card */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <ExternalLink className="h-5 w-5 text-primary" />
              <div>
                <h2 className="font-semibold">Microsoft Outlook</h2>
                <p className="text-sm text-muted-foreground">Agende reunioes via Outlook e Teams</p>
              </div>
            </div>

            {msLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                {!msStatus?.configured && (
                  <div className="text-sm text-muted-foreground">
                    <XCircle className="h-4 w-4 inline mr-1 text-yellow-500" />
                    Configuracao pendente no servidor. Defina as variaveis{" "}
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">MS_CLIENT_ID</code>,{" "}
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">MS_CLIENT_SECRET</code> e{" "}
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">MS_TENANT_ID</code> no backend.
                  </div>
                )}

                {msStatus?.configured && !msStatus.connected && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Conecte sua conta Microsoft para agendar reunioes via Outlook e Teams.
                    </p>
                    <Button size="sm" onClick={handleMsConnect} disabled={msActionLoading}>
                      {msActionLoading && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
                      Conectar Outlook
                    </Button>
                  </div>
                )}

                {msStatus?.connected && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500 font-medium">Conectado</span>
                    </div>
                    {msStatus.email && (
                      <p className="text-sm text-muted-foreground">{msStatus.email}</p>
                    )}
                    <Button size="sm" variant="outline" onClick={handleMsDisconnect} disabled={msActionLoading}>
                      {msActionLoading && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
                      Desconectar
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
