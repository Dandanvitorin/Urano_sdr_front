import { Users, TrendingUp, ThumbsUp, CalendarCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { AnalyticsData } from "@/types";

interface Props {
  data: AnalyticsData;
}

export function KpiCards({ data }: Props) {
  const { funnel } = data;
  const totalLeads =
    funnel.new + funnel.welcomed + funnel.qualifying + funnel.qualified +
    funnel.scheduling + funnel.scheduled + funnel.converted + funnel.lost +
    funnel.disqualified + funnel.no_response + funnel.handoff_requested +
    funnel.followup_total;

  const cards = [
    {
      label: "Total de Leads",
      value: totalLeads,
      icon: Users,
      color: "text-blue-500",
    },
    {
      label: "Taxa de Conversao",
      value: `${data.conversion_rates.overall}%`,
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      label: "Aprovacao AI",
      value: `${data.quality.approval_rate}%`,
      icon: ThumbsUp,
      color: "text-purple-500",
    },
    {
      label: "Reunioes Agendadas",
      value: data.funnel.scheduled + data.funnel.converted,
      icon: CalendarCheck,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-muted ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
