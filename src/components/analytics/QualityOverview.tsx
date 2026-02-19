import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import type { AnalyticsData } from "@/types";

interface Props {
  data: AnalyticsData;
}

const COLORS = {
  approved: "hsl(140, 70%, 45%)",
  edited: "hsl(45, 90%, 50%)",
  rejected: "hsl(0, 70%, 55%)",
};

const chartConfig = {
  approved: { label: "Aprovadas", color: COLORS.approved },
  edited: { label: "Editadas", color: COLORS.edited },
  rejected: { label: "Rejeitadas", color: COLORS.rejected },
};

export function QualityOverview({ data }: Props) {
  const { quality } = data;

  const pieData = [
    { name: "Aprovadas", value: quality.approved, fill: COLORS.approved },
    { name: "Editadas", value: quality.edited, fill: COLORS.edited },
    { name: "Rejeitadas", value: quality.rejected, fill: COLORS.rejected },
  ];

  const hasData = quality.total_reviewed > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Qualidade das Respostas</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="text-sm text-muted-foreground">Nenhuma resposta revisada ainda.</p>
        ) : (
          <div className="flex items-center gap-6">
            <ChartContainer config={chartConfig} className="h-[200px] w-[200px] shrink-0">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  strokeWidth={2}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Total revisadas:</span>{" "}
                <strong>{quality.total_reviewed}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Taxa de aprovacao:</span>{" "}
                <strong className="text-green-500">{quality.approval_rate}%</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Taxa de edicao:</span>{" "}
                <strong className="text-yellow-500">{quality.edit_rate}%</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Taxa de rejeicao:</span>{" "}
                <strong className="text-red-500">{quality.rejection_rate}%</strong>
              </div>
              {quality.avg_rating > 0 && (
                <div>
                  <span className="text-muted-foreground">Rating medio:</span>{" "}
                  <strong>{quality.avg_rating}/5</strong>
                </div>
              )}
              <div className="pt-1 text-xs text-muted-foreground">
                {quality.feedback_examples.approved_count} exemplos aprovados,{" "}
                {quality.feedback_examples.rejected_count} rejeitados
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
