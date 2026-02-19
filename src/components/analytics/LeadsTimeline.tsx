import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import type { AnalyticsData } from "@/types";

interface Props {
  data: AnalyticsData;
}

const chartConfig = {
  new_leads: { label: "Novos", color: "hsl(210, 80%, 55%)" },
  converted: { label: "Convertidos", color: "hsl(140, 70%, 45%)" },
  lost: { label: "Perdidos", color: "hsl(0, 70%, 55%)" },
};

export function LeadsTimeline({ data }: Props) {
  const chartData = data.leads_over_time.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Leads nos Ultimos 30 Dias</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={chartData} margin={{ left: 0, right: 10, top: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="new_leads"
              stroke="var(--color-new_leads)"
              fill="var(--color-new_leads)"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="converted"
              stroke="var(--color-converted)"
              fill="var(--color-converted)"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="lost"
              stroke="var(--color-lost)"
              fill="var(--color-lost)"
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
