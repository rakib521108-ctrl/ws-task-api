import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface AnalyticsMetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "purple" | "blue" | "violet" | "emerald";
  delay?: number;
  compact?: boolean;
}

const accentMap = {
  purple: "border-indigo-500/20 bg-indigo-500/10 text-indigo-300",
  blue: "border-blue-500/20 bg-blue-500/10 text-blue-300",
  violet: "border-violet-500/20 bg-violet-500/10 text-violet-300",
  emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
};

export default function AnalyticsMetricCard({
  label,
  value,
  icon: Icon,
  accent = "purple",
  delay = 0,
  compact = false,
}: AnalyticsMetricCardProps) {
  return (
    <div
      className={cn(
        "glass-card-hover animate-slide-up border border-glass-border",
        compact ? "p-4" : "p-5"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-gray-500">
            {label}
          </p>
          <p
            className={cn(
              "mt-1.5 font-bold text-white",
              compact ? "text-lg" : "text-xl sm:text-2xl"
            )}
          >
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
            accentMap[accent]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
