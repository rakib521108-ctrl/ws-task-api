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
  LineChart,
  Line,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface ChartData {
  name: string;
  registrations?: number;
  validUsers?: number;
  sms?: number;
  income?: number;
  [key: string]: string | number | undefined;
}

interface StatsChartProps {
  data: ChartData[];
  type?: "area" | "bar" | "line";
  dataKey?: string;
  color?: string;
  title?: string;
  chartId?: string;
  valueFormat?: "number" | "currency";
  height?: number;
}

export default function StatsChart({
  data,
  type = "area",
  dataKey = "income",
  color = "#818cf8",
  title,
  chartId = "default",
  valueFormat = "number",
  height = 280,
}: StatsChartProps) {
  const gradientId = `gradient-${chartId}-${dataKey}`;

  const formatValue = (v: number) =>
    valueFormat === "currency" ? formatCurrency(v) : v.toLocaleString();

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
          <p className="font-semibold text-white">
            {formatValue(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-4 sm:p-6 glow-purple">
      {title && (
        <h3 className="mb-4 text-base font-semibold text-white sm:text-lg">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {type === "bar" ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickMargin={8} />
            <YAxis stroke="#6b7280" fontSize={11} width={48} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
          </BarChart>
        ) : type === "line" ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickMargin={8} />
            <YAxis stroke="#6b7280" fontSize={11} width={48} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, r: 3 }}
            />
          </LineChart>
        ) : (
          <AreaChart data={data}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickMargin={8} />
            <YAxis stroke="#6b7280" fontSize={11} width={48} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={`url(#${gradientId})`}
              strokeWidth={2}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
