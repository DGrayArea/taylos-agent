"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, AlertTriangle, CheckCircle, FileText, RefreshCw, Activity } from "lucide-react";
import { ComprehensiveAnalysis } from "@/lib/types";

interface ReportRow {
  id: string;
  created_at: string;
  issues: number;
  documents: number;
  status: string;
  data: ComprehensiveAnalysis;
}

interface CaseRow {
  id: string;
  status: string;
  severity: string;
  created_at: string;
}

interface Props {
  reports: ReportRow[];
  cases: CaseRow[];
}

const COLORS = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#3b82f6",
  success: "#10b981",
  gold: "#d4af37",
};

const SEVERITY_COLORS = [COLORS.critical, COLORS.high, COLORS.medium, COLORS.low, COLORS.success];

export function AnalyticsDashboard({ reports, cases }: Props) {
  const [liveTime, setLiveTime] = useState(new Date());
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Compute aggregates
  const totalReports = reports.length;
  const totalAnomalies = reports.reduce((s, r) => s + (r.issues ?? 0), 0);
  const totalDocs = reports.reduce((s, r) => s + (r.documents ?? 0), 0);
  const avgConfidence = reports.length > 0
    ? Math.round(
        reports
          .flatMap((r) => r.data?.feature_2_anomalies?.anomaly_list ?? [])
          .reduce((s, a) => s + a.confidence, 0) /
          Math.max(
            1,
            reports.flatMap((r) => r.data?.feature_2_anomalies?.anomaly_list ?? []).length,
          ),
      )
    : 0;

  // Resolution rate
  const totalCases = cases.length;
  const resolvedCases = cases.filter((c) => c.status === "resolved").length;
  const resolutionRate = totalCases > 0 ? Math.round((resolvedCases / totalCases) * 100) : 0;

  // Severity breakdown across all reports
  const severityTotals = reports.reduce(
    (acc, r) => {
      const s = r.data?.feature_2_anomalies?.anomalies_by_severity;
      if (s) {
        acc.critical += s.critical ?? 0;
        acc.high += s.high ?? 0;
        acc.medium += s.medium ?? 0;
        acc.low += s.low ?? 0;
      }
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 },
  );

  const severityPieData = [
    { name: "Critical", value: severityTotals.critical, color: COLORS.critical },
    { name: "High", value: severityTotals.high, color: COLORS.high },
    { name: "Medium", value: severityTotals.medium, color: COLORS.medium },
    { name: "Low", value: severityTotals.low, color: COLORS.low },
  ].filter((d) => d.value > 0);

  // Case status breakdown
  const caseStatusData = [
    { name: "Open", value: cases.filter((c) => c.status === "open").length, color: COLORS.critical },
    { name: "In Review", value: cases.filter((c) => c.status === "in_review").length, color: COLORS.medium },
    { name: "Resolved", value: cases.filter((c) => c.status === "resolved").length, color: COLORS.success },
  ].filter((d) => d.value > 0);

  // Anomalies over time (last 30 days)
  const anomalyTrend = reports
    .slice(0, 30)
    .map((r) => ({
      date: new Date(r.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      anomalies: r.issues,
      documents: r.documents,
    }))
    .reverse();

  // Confidence trend
  const confidenceTrend = reports
    .slice(0, 20)
    .map((r) => {
      const list = r.data?.feature_2_anomalies?.anomaly_list ?? [];
      const avg = list.length > 0 ? Math.round(list.reduce((s, a) => s + a.confidence, 0) / list.length) : 0;
      return {
        date: new Date(r.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
        confidence: avg,
      };
    })
    .reverse();

  const statCards = [
    {
      icon: FileText,
      label: "Total Reviews",
      value: totalReports,
      sub: `${totalDocs} documents analysed`,
      color: COLORS.gold,
    },
    {
      icon: AlertTriangle,
      label: "Total Anomalies",
      value: totalAnomalies,
      sub: `${severityTotals.critical} critical`,
      color: COLORS.critical,
    },
    {
      icon: TrendingUp,
      label: "Avg Confidence",
      value: `${avgConfidence}%`,
      sub: "AI classification confidence",
      color: COLORS.success,
    },
    {
      icon: CheckCircle,
      label: "Resolution Rate",
      value: `${resolutionRate}%`,
      sub: `${resolvedCases} of ${totalCases} cases`,
      color: COLORS.success,
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
            Live · {liveTime.toLocaleTimeString("en-GB")}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <RefreshCw className="w-3 h-3" />
          Updates every second
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white/5 border border-white/10 p-5 hover:bg-white/8 transition-all group"
            style={{ borderTop: `3px solid ${stat.color}` }}
          >
            <div className="flex items-start justify-between mb-3">
              <stat.icon className="w-5 h-5 mt-0.5" style={{ color: stat.color }} />
            </div>
            <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">{stat.label}</div>
            <div className="text-xs text-gray-600 mt-1">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Anomaly Trend */}
        <div className="md:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-4 h-4 text-[var(--color-gold)]" />
            <h2 className="font-semibold text-white">Anomaly Trend</h2>
            <span className="ml-auto text-xs text-gray-500">Last {anomalyTrend.length} reviews</span>
          </div>
          {anomalyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={anomalyTrend}>
                <defs>
                  <linearGradient id="anomGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.critical} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.critical} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" }}
                />
                <Area type="monotone" dataKey="anomalies" stroke={COLORS.critical} fill="url(#anomGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">
              No data yet — upload documents to see trends
            </div>
          )}
        </div>

        {/* Severity Pie */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <h2 className="font-semibold text-white mb-6">By Severity</h2>
          {severityPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={severityPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {severityPieData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.color}
                      opacity={activeIndex === null || activeIndex === index ? 1 : 0.5}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" }}
                />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">No anomalies yet</div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Confidence Trend */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <h2 className="font-semibold text-white mb-6">AI Confidence Trend</h2>
          {confidenceTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={confidenceTrend}>
                <defs>
                  <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" }}
                />
                <Area type="monotone" dataKey="confidence" stroke={COLORS.success} fill="url(#confGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-gray-500 text-sm">No data yet</div>
          )}
        </div>

        {/* Case Status */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <h2 className="font-semibold text-white mb-6">Case Status Distribution</h2>
          {caseStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={caseStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {caseStatusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-gray-500 text-sm">
              No cases yet — open the Cases page to create one
            </div>
          )}
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="font-semibold text-white">Recent Reports</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["Date", "Documents", "Issues", "Status", "Data Quality"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {reports.slice(0, 10).map((r) => (
                <tr key={r.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-6 py-4 text-gray-300">
                    {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4 text-gray-300">{r.documents}</td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${r.issues > 0 ? "text-red-400" : "text-green-400"}`}>
                      {r.issues}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-400/10 text-green-400 border border-green-400/20">
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {r.data?.analysis_metadata?.data_quality_score
                      ? `${Math.round(r.data.analysis_metadata.data_quality_score * 100)}%`
                      : "—"}
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No reports yet — upload your first document to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
