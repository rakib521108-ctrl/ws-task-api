import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TodayStatTileProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delay?: number;
}

export default function TodayStatTile({
  label,
  value,
  icon: Icon,
  delay = 0,
}: TodayStatTileProps) {
  return (
    <div
      className={cn(
        "glass-card-hover flex items-center gap-4 p-5 animate-slide-up"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 border border-accent/20">
        <Icon className="h-5 w-5 text-accent-light" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <p className="mt-0.5 text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
