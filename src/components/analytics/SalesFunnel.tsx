import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import type { AnalyticsData } from "@/types";

interface Props {
  data: AnalyticsData;
}

const chartConfig = {
  count: { label: "Leads", color: "hsl(var(--primary))" },
};

export function SalesFunnel({ data }: Props) {
  const stages = [
    { name: "Novos", count: data.funnel.new, fill: "hsl(210, 80%, 55%)" },
    { name: "Boas-vindas", count: data.funnel.welcomed, fill: "hsl(230, 65%, 55%)" },
    { name: "Qualificando", count: data.funnel.qualifying, fill: "hsl(35, 80%, 55%)" },
    { name: "Qualificados", count: data.funnel.qualified, fill: "hsl(150, 60%, 45%)" },
    { name: "Agendando", count: data.funnel.scheduling, fill: "hsl(200, 70%, 50%)" },
    { name: "Agendados", count: data.funnel.scheduled, fill: "hsl(160, 65%, 45%)" },
    { name: "Convertidos", count: data.funnel.converted, fill: "hsl(140, 70%, 40%)" },
    { name: "Follow-up", count: data.funnel.followup_total, fill: "hsl(30, 75%, 50%)" },
    { name: "Sem Resposta", count: data.funnel.no_response, fill: "hsl(0, 0%, 55%)" },
    { name: "Desqualificados", count: data.funnel.disqualified, fill: "hsl(0, 65%, 50%)" },
    { name: "Perdidos", count: data.funnel.lost, fill: "hsl(0, 70%, 45%)" },
  ];

  // Filter out stages with 0 leads to keep the chart clean
  const visibleStages = stages.filter((s) => s.count > 0);

  const rates = data.conversion_rates;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Funil de Vendas</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <BarChart data={visibleStages} layout="vertical" margin={{ left: 20, right: 40 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={110} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>Qualificacao: <strong className="text-foreground">{rates.qualifying_to_qualified}%</strong></span>
          <span>Agendamento: <strong className="text-foreground">{rates.qualified_to_scheduled}%</strong></span>
          <span>Conversao: <strong className="text-foreground">{rates.scheduled_to_converted}%</strong></span>
          <span>Geral: <strong className="text-foreground">{rates.overall}%</strong></span>
          <span>Sem resposta: <strong className="text-foreground">{rates.no_response_rate}%</strong></span>
          <span>Desqualificacao: <strong className="text-foreground">{rates.disqualification_rate}%</strong></span>
        </div>
        {/* Follow-up breakdown */}
        {Object.keys(data.funnel.followup_breakdown).length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Detalhamento Follow-up:</p>
            <div className="flex flex-wrap gap-2 text-xs">
              {Object.entries(data.funnel.followup_breakdown).map(([key, count]) => {
                const day = key.replace("followup_d", "D");
                return (
                  <span key={key} className="px-2 py-0.5 rounded bg-warning/15 text-warning border border-warning/30">
                    {day}: {count}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
