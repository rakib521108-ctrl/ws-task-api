import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  delay?: number;
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  delay = 0,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn("stat-card", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
          {trend && (
            <p className="mt-1 text-xs text-emerald-400">{trend}</p>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 border border-accent/20">
          <Icon className="h-6 w-6 text-accent-light" />
        </div>
      </div>
    </div>
  );
}
