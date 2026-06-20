"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface ChartData {
  name: string;
  registrations?: number;
  validUsers?: number;
  sms?: number;
  income?: number;
}

interface StatsChartProps {
  data: ChartData[];
  type?: "area" | "bar";
  dataKey?: keyof ChartData;
  color?: string;
  title?: string;
}

export default function StatsChart({
  data,
  type = "area",
  dataKey = "income",
  color = "#818cf8",
  title,
}: StatsChartProps) {
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: { value: number }[];
    label?: string;
  }) => {
    if (active && payload?.length) {
      return (
        <div className="glass-card px-4 py-2 text-sm">
          <p className="text-gray-400">{label}</p>
          <p className="font-semibold text-white">{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6">
      {title && (
        <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={280}>
        {type === "area" ? (
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={`url(#gradient-${dataKey})`}
              strokeWidth={2}
            />
          </AreaChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
