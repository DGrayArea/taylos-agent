"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { FloatingCard } from "@/components/ui/FloatingCard";
import { TrendingUp, PieChart as PieIcon, BarChart3 } from "lucide-react";

// ─── Formatters ────────────────────────────────────────────
function fmtNaira(val: number): string {
  if (val >= 1_000_000) return `₦${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `₦${(val / 1_000).toFixed(0)}K`;
  return `₦${val.toFixed(0)}`;
}

// ─── Colours ──────────────────────────────────────────────
const SEVERITY_COLORS = {
  Critical: "#ef4444",
  "High Priority": "#f59e0b",
  Medium: "#d4af37",
  Low: "#10b981",
};

const PIE_COLORS = [
  "#d4af37", "#ef4444", "#f59e0b", "#10b981", "#6366f1", "#8b5cf6",
];

const CHART_TOOLTIP_STYLE = {
  backgroundColor: "#0a1628",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "12px",
};

// ─────────────────────────────────────────────────────────────
// Severity Bar Chart
// ─────────────────────────────────────────────────────────────
interface SeverityChartProps {
  data: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export function SeverityBarChart({ data }: SeverityChartProps) {
  const chartData = [
    { name: "Critical", count: data.critical, fill: "#ef4444" },
    { name: "High Priority", count: data.high, fill: "#f59e0b" },
    { name: "Medium", count: data.medium, fill: "#d4af37" },
    { name: "Low", count: data.low, fill: "#10b981" },
  ].filter((d) => d.count > 0);

  if (chartData.length === 0) return null;

  return (
    <FloatingCard className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-[var(--color-gold)]" />
        <span className="text-sm font-semibold text-gray-300">Issues by Priority</span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={(val: any) => [val, "Issues"]}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </FloatingCard>
  );
}

// ─────────────────────────────────────────────────────────────
// Spending Breakdown Pie Chart
// ─────────────────────────────────────────────────────────────
interface SpendingPieProps {
  data: Record<string, number>;
}

export function SpendingBreakdownPie({ data }: SpendingPieProps) {
  const chartData = Object.entries(data)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (chartData.length === 0) return null;

  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <FloatingCard className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <PieIcon className="w-4 h-4 text-[var(--color-gold)]" />
        <span className="text-sm font-semibold text-gray-300">Spending Breakdown</span>
      </div>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width="50%" height={160}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              dataKey="value"
              paddingAngle={2}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              formatter={(val: any) => [fmtNaira(Number(val)), ""]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2">
          {chartData.slice(0, 5).map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                <span className="text-gray-300 truncate max-w-[90px]">{item.name}</span>
              </div>
              <span className="text-gray-400 font-medium">
                {total > 0 ? `${Math.round((item.value / total) * 100)}%` : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </FloatingCard>
  );
}

// ─────────────────────────────────────────────────────────────
// Monthly Transaction Trend Area Chart
// ─────────────────────────────────────────────────────────────
interface MonthlyTrendProps {
  data: Array<{
    month: string;
    total_debits: number;
    total_credits: number;
    anomaly_count: number;
  }>;
}

export function MonthlyTrendChart({ data }: MonthlyTrendProps) {
  if (!data || data.length === 0) return null;

  return (
    <FloatingCard className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-[var(--color-gold)]" />
        <span className="text-sm font-semibold text-gray-300">Monthly Transaction Trend</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="debitsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="creditsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtNaira} />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={(val: any, name: any) => [fmtNaira(Number(val)), name === "total_debits" ? "Debits" : "Credits"]}
          />
          <Legend
            formatter={(val) => val === "total_debits" ? "Outflows" : "Inflows"}
            wrapperStyle={{ fontSize: 10, color: "#9ca3af" }}
          />
          <Area type="monotone" dataKey="total_debits" stroke="#ef4444" fill="url(#debitsGrad)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="total_credits" stroke="#10b981" fill="url(#creditsGrad)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </FloatingCard>
  );
}

// ─────────────────────────────────────────────────────────────
// Combined Charts Panel — used in AnalysisReport
// ─────────────────────────────────────────────────────────────
interface ChartsPanelProps {
  anomaliesBySeverity?: { critical: number; high: number; medium: number; low: number };
  spendingByCategory?: Record<string, number>;
  monthlyTrend?: Array<{ month: string; total_debits: number; total_credits: number; anomaly_count: number }>;
}

export function AnalysisChartsPanel({
  anomaliesBySeverity,
  spendingByCategory,
  monthlyTrend,
}: ChartsPanelProps) {
  const hasAnomalyChart = anomaliesBySeverity &&
    Object.values(anomaliesBySeverity).some((v) => v > 0);
  const hasSpending = spendingByCategory &&
    Object.values(spendingByCategory).some((v) => v > 0);
  const hasTrend = monthlyTrend && monthlyTrend.length > 0;

  if (!hasAnomalyChart && !hasSpending && !hasTrend) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-[var(--color-gold)]" />
        Visual Analysis
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hasAnomalyChart && <SeverityBarChart data={anomaliesBySeverity!} />}
        {hasSpending && <SpendingBreakdownPie data={spendingByCategory!} />}
      </div>

      {hasTrend && (
        <MonthlyTrendChart data={monthlyTrend!} />
      )}
    </div>
  );
}
