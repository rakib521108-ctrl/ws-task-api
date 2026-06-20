import { cn, formatCurrency } from "@/lib/utils";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface ComparisonStatProps {
  title: string;
  lastMonth: number;
  thisMonth: number;
  changePercent: number;
  format?: "number" | "currency";
}

export default function ComparisonStat({
  title,
  lastMonth,
  thisMonth,
  changePercent,
  format = "number",
}: ComparisonStatProps) {
  const fmt = (n: number) =>
    format === "currency" ? formatCurrency(n) : n.toLocaleString();

  const isUp = changePercent > 0;
  const isDown = changePercent < 0;
  const isFlat = changePercent === 0;

  return (
    <div className="glass-card p-5 glow-blue">
      <p className="mb-4 text-sm font-semibold text-white">{title}</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Last Month</p>
          <p className="mt-1 text-lg font-bold text-gray-300">{fmt(lastMonth)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">This Month</p>
          <p className="mt-1 text-lg font-bold text-white">{fmt(thisMonth)}</p>
        </div>
      </div>
      <div
        className={cn(
          "mt-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium",
          isUp && "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
          isDown && "border-red-500/30 bg-red-500/10 text-red-400",
          isFlat && "border-gray-500/30 bg-gray-500/10 text-gray-400"
        )}
      >
        {isUp && <TrendingUp className="h-4 w-4" />}
        {isDown && <TrendingDown className="h-4 w-4" />}
        {isFlat && <Minus className="h-4 w-4" />}
        <span>
          {isFlat
            ? "No change vs last month"
            : `${isUp ? "+" : ""}${changePercent.toFixed(1)}% vs last month`}
        </span>
      </div>
    </div>
  );
}
