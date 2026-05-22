"use client";

import { useMemo } from "react";
import { FloatingCard } from "@/components/ui/FloatingCard";
import { Badge } from "@/components/ui/Badge";
import { AnalysisChartsPanel } from "@/components/charts/AnalysisCharts";
import {
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Info,
  TrendingDown,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
} from "lucide-react";
import Link from "next/link";

interface Report {
  id: string;
  created_at: string;
  documents: number;
  issues: number;
  data: any;
}

interface Props {
  reports: Report[];
}

const SEVERITY_ICONS = {
  CRITICAL: ShieldAlert,
  HIGH: AlertTriangle,
  MEDIUM: AlertCircle,
  LOW: Info,
};
const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "text-[var(--color-critical)]",
  HIGH: "text-[var(--color-warning)]",
  MEDIUM: "text-[var(--color-gold)]",
  LOW: "text-[var(--color-success)]",
};
const SEVERITY_BG: Record<string, string> = {
  CRITICAL: "bg-[var(--color-critical)]/10 border-[var(--color-critical)]/30",
  HIGH: "bg-[var(--color-warning)]/10 border-[var(--color-warning)]/30",
  MEDIUM: "bg-[var(--color-gold)]/10 border-[var(--color-gold)]/30",
  LOW: "bg-[var(--color-success)]/10 border-[var(--color-success)]/30",
};

function fmtNaira(n: number): string {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
}

function formatAnomalyType(type: string): string {
  const labels: Record<string, string> = {
    DUPLICATE_TRANSACTION: "Duplicate Payment",
    DUPLICATE_CHARGE: "Duplicate Charge",
    UNUSUAL_PATTERN: "Unusual Activity",
    MISSING_RECEIPT: "Missing Receipt",
    SELF_APPROVAL: "Self-Approval Violation",
    GHOST_VENDOR: "Unrecognised Vendor",
    SPLIT_TRANSACTION: "Split Payment",
    OFFSHORE_TRANSFER: "Offshore Transfer",
    PAYROLL_ANOMALY: "Payroll Irregularity",
    MISSING_DOCUMENTATION: "Missing Documentation",
    VELOCITY_ANOMALY: "Unusual Volume",
    BILLING_ERROR: "Billing Error",
    CUSTOMER_ERROR: "Data Entry Error",
  };
  return labels[type.toUpperCase().replace(/ /g, "_")] ?? type;
}

export function MonitorDashboard({ reports }: Props) {
  // ── Aggregate all anomalies from all reports ──
  const { allAnomalies, totalRisk, totalTransactions, aggregateBySeverity } =
    useMemo(() => {
      let totalRisk = 0;
      let totalTransactions = 0;
      const agg = { critical: 0, high: 0, medium: 0, low: 0 };
      const anomalies: Array<{ anomaly: any; reportId: string; reportDate: string }> = [];

      reports.forEach((r) => {
        const analysis = r.data;
        if (!analysis) return;
        totalTransactions +=
          analysis.analysis_metadata?.total_transactions_analyzed ?? 0;
        const list: any[] =
          analysis.feature_2_anomalies?.anomaly_list ?? [];
        list.forEach((a) => {
          const sev = (a.severity ?? "LOW").toUpperCase();
          if (sev === "CRITICAL") agg.critical++;
          else if (sev === "HIGH") agg.high++;
          else if (sev === "MEDIUM") agg.medium++;
          else agg.low++;
          const amt = a.affected_amounts?.[0] ?? 0;
          if (sev === "CRITICAL" || sev === "HIGH") totalRisk += Number(amt);
          anomalies.push({ anomaly: a, reportId: r.id, reportDate: r.created_at });
        });
      });

      // Sort by severity (critical first) then date
      anomalies.sort((a, b) => {
        const order = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
        const ai = order.indexOf((a.anomaly.severity ?? "LOW").toUpperCase());
        const bi = order.indexOf((b.anomaly.severity ?? "LOW").toUpperCase());
        return ai - bi;
      });

      return {
        allAnomalies: anomalies,
        totalRisk,
        totalTransactions,
        aggregateBySeverity: agg,
      };
    }, [reports]);

  // Build aggregate spending — merge from all reports
  const aggregateSpending: Record<string, number> = useMemo(() => {
    const merged: Record<string, number> = {};
    reports.forEach((r) => {
      const cat = r.data?.spending_by_category ?? {};
      Object.entries(cat).forEach(([k, v]) => {
        merged[k] = (merged[k] ?? 0) + Number(v);
      });
    });
    return merged;
  }, [reports]);

  const totalIssues = allAnomalies.length;
  const criticalAndHigh = allAnomalies.filter(
    (a) => ["CRITICAL", "HIGH"].includes((a.anomaly.severity ?? "").toUpperCase())
  );

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Activity className="w-14 h-14 text-gray-600 mb-4" />
        <p className="text-gray-400 text-lg font-medium">No data to monitor yet</p>
        <p className="text-gray-600 text-sm mt-2 max-w-sm">
          Upload and analyse your first documents to see a live overview here.
        </p>
        <Link
          href="/upload"
          className="mt-6 px-5 py-2.5 rounded-xl bg-[var(--color-gold)] text-[var(--color-navy)] font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Upload Documents
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Summary KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <FloatingCard className="p-5">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">Reports Reviewed</div>
          <div className="text-3xl font-bold">{reports.length}</div>
          <div className="text-xs text-gray-500 mt-1">{reports.reduce((s, r) => s + (r.documents ?? 0), 0)} total documents</div>
        </FloatingCard>
        <FloatingCard className="p-5">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">Records Checked</div>
          <div className="text-3xl font-bold">{totalTransactions.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">Across all uploads</div>
        </FloatingCard>
        <FloatingCard className="p-5 border-t-4 border-t-[var(--color-critical)]">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">Total Issues Found</div>
          <div className="text-3xl font-bold text-[var(--color-critical)]">{totalIssues}</div>
          <div className="text-xs text-gray-500 mt-1">{criticalAndHigh.length} require immediate action</div>
        </FloatingCard>
        <FloatingCard className="p-5 border-t-4 border-t-[var(--color-warning)]">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">Total Amount at Risk</div>
          <div className="text-2xl font-bold text-[var(--color-warning)]">{fmtNaira(totalRisk)}</div>
          <div className="text-xs text-gray-500 mt-1">Critical &amp; high priority only</div>
        </FloatingCard>
      </div>

      {/* ── Charts row ── */}
      <AnalysisChartsPanel
        anomaliesBySeverity={aggregateBySeverity}
        spendingByCategory={Object.keys(aggregateSpending).length > 0 ? aggregateSpending : undefined}
      />

      {/* ── Flagged Transactions Feed ── */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-[var(--color-critical)]" />
          Flagged Transactions
          {criticalAndHigh.length > 0 && (
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[var(--color-critical)]/20 text-[var(--color-critical)] font-semibold">
              {criticalAndHigh.length} need attention
            </span>
          )}
        </h2>
        <div className="space-y-3">
          {allAnomalies.slice(0, 20).map(({ anomaly, reportId, reportDate }, i) => {
            const sev = (anomaly.severity ?? "LOW").toUpperCase();
            const SevIcon = SEVERITY_ICONS[sev as keyof typeof SEVERITY_ICONS] ?? Info;
            const typeLabel = formatAnomalyType(anomaly.type ?? "");
            const amount = anomaly.affected_amounts?.[0];

            return (
              <FloatingCard
                key={`${reportId}-${i}`}
                className={`p-4 border ${SEVERITY_BG[sev] ?? "border-white/10"}`}
              >
                <div className="flex items-start gap-4">
                  <SevIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${SEVERITY_COLORS[sev] ?? "text-gray-400"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm text-white">{typeLabel}</span>
                      <Badge variant={anomaly.severity?.toLowerCase() as any} className="text-xs">
                        {sev === "CRITICAL" ? "Critical" : sev === "HIGH" ? "High Priority" : sev === "MEDIUM" ? "Medium" : "Low"}
                      </Badge>
                      {amount != null && (
                        <span className="text-xs text-[var(--color-critical)] font-medium">
                          {fmtNaira(Number(amount))}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{anomaly.description}</p>
                    {anomaly.related_documents?.length > 0 && (
                      <p className="text-[11px] text-[var(--color-gold-light)] mt-1">
                        {anomaly.related_documents.join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[10px] text-gray-500 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {new Date(reportDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </div>
                    <div className="text-[10px] text-gray-600 mt-1">
                      Ref: {reportId.substring(0, 6).toUpperCase()}
                    </div>
                  </div>
                </div>
              </FloatingCard>
            );
          })}

          {allAnomalies.length === 0 && (
            <FloatingCard className="p-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-[var(--color-success)] mx-auto mb-3" />
              <p className="text-gray-300 font-medium">No issues flagged across all your reviews</p>
              <p className="text-gray-500 text-sm mt-1">Your documents are clean.</p>
            </FloatingCard>
          )}
        </div>
      </div>

      {/* ── Recent Reviews ── */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-400" />
          Recent Reviews
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          {reports.slice(0, 6).map((r) => (
            <FloatingCard key={r.id} className="p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${r.issues > 0 ? "bg-[var(--color-critical)]/10" : "bg-[var(--color-success)]/10"}`}>
                {r.issues > 0 ? (
                  <XCircle className="w-5 h-5 text-[var(--color-critical)]" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {r.id.substring(0, 8).toUpperCase()}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  {" · "}{r.documents} doc{r.documents !== 1 ? "s" : ""}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold ${r.issues > 0 ? "text-[var(--color-critical)]" : "text-[var(--color-success)]"}`}>
                  {r.issues > 0 ? `${r.issues} issue${r.issues > 1 ? "s" : ""}` : "Clean"}
                </div>
              </div>
            </FloatingCard>
          ))}
        </div>
      </div>
    </div>
  );
}
