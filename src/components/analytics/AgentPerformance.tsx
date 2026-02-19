import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import type { AnalyticsData } from "@/types";

interface Props {
  data: AnalyticsData;
}

const chartConfig = {
  approved: { label: "Aprovadas", color: "hsl(140, 70%, 45%)" },
  edited: { label: "Editadas", color: "hsl(45, 90%, 50%)" },
  rejected: { label: "Rejeitadas", color: "hsl(0, 70%, 55%)" },
};

const AGENT_LABELS: Record<string, string> = {
  welcome: "Boas-vindas",
  qualification: "Qualificacao",
  scheduling: "Agendamento",
  objection_handler: "Objecoes",
  "objection handler": "Objecoes",
  followup: "Follow-up",
  "follow-up": "Follow-up",
  noshow: "No-show",
  "no-show": "No-show",
  reengagement: "Reengajamento",
  nudge: "Nudge",
};

export function AgentPerformance({ data }: Props) {
  const chartData = Object.entries(data.agents).map(([agent, stats]) => ({
    name: AGENT_LABELS[agent] || agent,
    approved: stats.approved,
    edited: stats.edited,
    rejected: stats.rejected,
  }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Performance por Agente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhuma resposta revisada ainda.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Performance por Agente</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart data={chartData} margin={{ left: 0, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey="approved" stackId="a" fill="var(--color-approved)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="edited" stackId="a" fill="var(--color-edited)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="rejected" stackId="a" fill="var(--color-rejected)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
