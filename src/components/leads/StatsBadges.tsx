import type { Stats } from "@/types";

interface Props {
  stats: Stats;
}

export function StatsBadges({ stats }: Props) {
  return (
    <div className="p-3 border-t border-border flex flex-wrap gap-1.5">
      <StatPill label="Total" value={stats.total_leads} />
      <StatPill label="Qualif." value={stats.qualified_leads} color="success" />
      <StatPill label="Reuniões" value={stats.scheduled_meetings} color="info" />
      <StatPill
        label="Pendentes"
        value={stats.pending_responses}
        color={stats.pending_responses > 0 ? "warning" : undefined}
      />
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color?: string }) {
  const colorClasses = {
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    info: "bg-info/15 text-info",
  };
  const cls = color && colorClasses[color as keyof typeof colorClasses]
    ? colorClasses[color as keyof typeof colorClasses]
    : "bg-secondary text-muted-foreground";

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}: {value}
    </span>
  );
}
