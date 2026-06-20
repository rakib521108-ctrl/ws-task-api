import { LucideIcon } from "lucide-react";
import AnalyticsMetricCard from "@/components/AnalyticsMetricCard";

interface MetricItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "purple" | "blue" | "violet" | "emerald";
}

interface AnalyticsMetricGroupProps {
  title: string;
  icon: LucideIcon;
  metrics: MetricItem[];
}

export default function AnalyticsMetricGroup({
  title,
  icon: GroupIcon,
  metrics,
}: AnalyticsMetricGroupProps) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <GroupIcon className="h-5 w-5 text-accent-light" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
          {title}
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {metrics.map((m, i) => (
          <AnalyticsMetricCard
            key={m.label}
            label={m.label}
            value={m.value}
            icon={m.icon}
            accent={m.accent}
            delay={i * 50}
            compact
          />
        ))}
      </div>
    </section>
  );
}
