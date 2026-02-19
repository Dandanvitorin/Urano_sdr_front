import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalyticsStore } from "@/stores/analyticsStore";
import { KpiCards } from "./KpiCards";
import { SalesFunnel } from "./SalesFunnel";
import { AgentPerformance } from "./AgentPerformance";
import { QualityOverview } from "./QualityOverview";
import { LeadsTimeline } from "./LeadsTimeline";

export function AnalyticsPanel() {
  const { data, loading, refresh } = useAnalyticsStore();

  useEffect(() => {
    refresh();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Carregando analytics...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Nao foi possivel carregar os dados.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-lg font-semibold">Relatorios</h1>
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <KpiCards data={data} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SalesFunnel data={data} />
          <AgentPerformance data={data} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <QualityOverview data={data} />
          <LeadsTimeline data={data} />
        </div>
      </div>
    </div>
  );
}
