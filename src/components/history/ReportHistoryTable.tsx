"use client";

import { useEffect, useMemo, useState } from "react";
import { FloatingCard } from "@/components/ui/FloatingCard";
import { Badge } from "@/components/ui/Badge";
import {
  Download,
  ChevronDown,
  ChevronUp,
  Eye,
  FileSearch,
  AlertTriangle,
  ShieldAlert,
  Info,
  AlertCircle,
  FileDown,
  Loader2,
  Trash2,
} from "lucide-react";
import { formatNaira, getDocumentNamesFromAnalysis } from "@/lib/utils";
import { AnalysisChartsPanel } from "@/components/charts/AnalysisCharts";
import { ReportHistoryRow } from "@/lib/types";

type ReportRow = ReportHistoryRow;

interface ReportHistoryTableProps {
  history: ReportRow[];
}

function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatAnomalyType(type: string): string {
  const labels: Record<string, string> = {
    DUPLICATE_TRANSACTION: "Duplicate Payment",
    DUPLICATE_CHARGE: "Duplicate Charge",
    UNUSUAL_PATTERN: "Unusual Activity",
    MISSING_RECEIPT: "Missing Receipt",
    SYSTEM_SYNC_DELAY: "Processing Delay",
    FRAUD: "Possible Fraud",
    BILLING_ERROR: "Billing Error",
    CUSTOMER_ERROR: "Data Entry Error",
    SYSTEM_GLITCH: "System Delay",
  };
  return labels[type.toUpperCase().replace(/ /g, "_")] ?? type;
}

const severityConfig = {
  CRITICAL: {
    label: "Critical",
    icon: ShieldAlert,
    color: "text-[var(--color-critical)]",
  },
  HIGH: {
    label: "High Priority",
    icon: AlertTriangle,
    color: "text-[var(--color-warning)]",
  },
  MEDIUM: {
    label: "Medium",
    icon: AlertCircle,
    color: "text-[var(--color-gold)]",
  },
  LOW: { label: "Low", icon: Info, color: "text-[var(--color-success)]" },
  INFORMATIONAL: { label: "Info", icon: Info, color: "text-gray-400" },
};

export function ReportHistoryTable({ history }: ReportHistoryTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [rows, setRows] = useState<ReportRow[]>(history ?? []);

  useEffect(() => {
    setRows(history ?? []);
  }, [history]);

  const selectedReport = useMemo(
    () => rows.find((row) => row.id === expandedId),
    [rows, expandedId],
  );

  const handleExportPDF = async (reportId: string) => {
    setPdfLoading(reportId);
    try {
      const res = await fetch(`/api/report/pdf?id=${reportId}`);
      if (!res.ok) throw new Error("PDF failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Taylos-Report-${reportId.substring(0, 8).toUpperCase()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setPdfError("PDF export failed. Try again or download JSON.");
    } finally {
      setPdfLoading(null);
    }
  };

  const openDeleteDialog = (reportId: string) => {
    setPendingDeleteId(reportId);
  };

  const closeDeleteDialog = () => {
    setPendingDeleteId(null);
  };

  const confirmDeleteReport = async () => {
    if (!pendingDeleteId) {
      return;
    }

    setDeletingId(pendingDeleteId);
    try {
      const res = await fetch("/api/reports/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pendingDeleteId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.error ?? "Delete failed");
      }

      setRows((current) => current.filter((row) => row.id !== pendingDeleteId));
      if (expandedId === pendingDeleteId) {
        setExpandedId(null);
      }
      closeDeleteDialog();
    } catch (error) {
      console.error("Delete report failed", error);
      alert("Unable to delete this report. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <FloatingCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-gray-500 tracking-wider">
                <th className="p-4 font-medium">Reference</th>
                <th className="p-4 font-medium">Date Reviewed</th>
                <th className="p-4 font-medium">Documents</th>
                <th className="p-4 font-medium">Issues Found</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-4 font-medium text-white">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-[var(--color-gold)] flex-shrink-0" />
                      <span className="font-mono text-sm">
                        {row.id.substring(0, 8).toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-300">
                    {new Date(row.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    <span className="text-gray-500">
                      {new Date(row.created_at).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-300">{row.documents}</td>
                  <td className="p-4 text-sm">
                    {row.issues > 0 ? (
                      <span className="text-[var(--color-critical)] font-bold">
                        {row.issues} found
                      </span>
                    ) : (
                      <span className="text-[var(--color-success)]">
                        None found
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <Badge variant="outline">{row.status}</Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="text-[var(--color-gold-light)] hover:text-white transition-colors p-2 inline-flex items-center gap-2 text-sm"
                        type="button"
                        onClick={() =>
                          setExpandedId(expandedId === row.id ? null : row.id)
                        }
                      >
                        {expandedId === row.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                        {expandedId === row.id ? "Close" : "View"}
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === row.id}
                        onClick={() => openDeleteDialog(row.id)}
                        className="inline-flex items-center gap-2 text-sm text-rose-400 hover:text-white transition-colors p-2 rounded-xl border border-rose-500/20 hover:border-rose-300/40 disabled:opacity-60"
                      >
                        <Trash2 className="w-4 h-4" />
                        {deletingId === row.id ? "Deleting" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FileSearch className="w-10 h-10 text-gray-600" />
                      <p className="text-gray-400 font-medium">
                        No reviews yet
                      </p>
                      <p className="text-gray-600 text-sm">
                        Go to{" "}
                        <span className="text-[var(--color-gold-light)]">
                          Upload Documents
                        </span>{" "}
                        to submit your first document for review.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </FloatingCard>

      {/* Expanded Report Detail — structured, not raw JSON */}
      {selectedReport && (
        <FloatingCard className="p-6">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-gray-500 mb-1">
                  Review Reference
                </div>
                <div className="text-lg font-semibold font-mono">
                  {selectedReport.id.substring(0, 8).toUpperCase()}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {new Date(selectedReport.created_at).toLocaleDateString(
                    "en-GB",
                    {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleExportPDF(selectedReport.id)}
                  disabled={pdfLoading === selectedReport.id}
                  className="inline-flex items-center gap-2 bg-[var(--color-gold)] text-[var(--color-navy)] text-sm font-semibold transition-opacity hover:opacity-90 px-4 py-2 rounded-xl disabled:opacity-60"
                >
                  {pdfLoading === selectedReport.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileDown className="w-4 h-4" />
                  )}
                  {pdfLoading === selectedReport.id
                    ? "Generating..."
                    : "Export Anomalies (PDF)"}
                </button>
                <button
                  onClick={() =>
                    downloadJSON(
                      selectedReport.data,
                      `report-${selectedReport.id.substring(0, 8)}.json`,
                    )
                  }
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors px-4 py-2 rounded-xl border border-white/10 hover:border-white/30"
                >
                  <Download className="w-4 h-4" />
                  Export Anomalies (JSON)
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-white/5 p-4">
                <div className="text-sm text-gray-400">Documents Reviewed</div>
                <div className="mt-2 text-xl font-semibold">
                  {selectedReport.documents}
                </div>
              </div>
              <div className="rounded-3xl bg-white/5 p-4">
                <div className="text-sm text-gray-400">Issues Found</div>
                <div
                  className={`mt-2 text-xl font-semibold ${selectedReport.issues > 0 ? "text-[var(--color-critical)]" : "text-[var(--color-success)]"}`}
                >
                  {selectedReport.issues > 0 ? selectedReport.issues : "None"}
                </div>
              </div>
              <div className="rounded-3xl bg-white/5 p-4">
                <div className="text-sm text-gray-400">Review Date</div>
                <div className="mt-2 text-xl font-semibold">
                  {new Date(selectedReport.created_at).toLocaleDateString(
                    "en-GB",
                  )}
                </div>
              </div>
            </div>

            {/* Charts */}
            {selectedReport.data?.feature_2_anomalies
              ?.anomalies_by_severity && (
              <AnalysisChartsPanel
                anomaliesBySeverity={
                  selectedReport.data.feature_2_anomalies.anomalies_by_severity
                }
                spendingByCategory={selectedReport.data.spending_by_category}
                monthlyTrend={selectedReport.data.monthly_trend}
              />
            )}

            {/* Documents checked */}
            {(() => {
              const docNames = getDocumentNamesFromAnalysis(
                selectedReport.data,
              );
              return docNames.length > 0 ? (
                <div className="rounded-3xl bg-white/5 p-4 border border-white/10">
                  <div className="text-sm text-gray-400 mb-2">
                    Documents Submitted
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {docNames.map((doc) => (
                      <span
                        key={doc}
                        className="px-3 py-1 rounded-full bg-black/30 text-sm text-white border border-white/10"
                      >
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Executive Summary + Recommendation */}
            <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
              <div className="rounded-3xl bg-[var(--color-navy)]/80 p-5 border border-white/10">
                <div className="text-sm text-gray-400 mb-2 font-medium">
                  Summary
                </div>
                <p className="text-sm text-gray-200 leading-relaxed">
                  {selectedReport.data?.executive_summary?.finding ??
                    "No summary available."}
                </p>
                {selectedReport.data?.executive_summary?.root_cause && (
                  <p className="text-sm text-gray-400 leading-relaxed mt-3">
                    {selectedReport.data.executive_summary.root_cause}
                  </p>
                )}
              </div>
              <div className="rounded-3xl bg-[var(--color-navy)]/80 p-5 border border-white/10">
                <div className="text-sm text-gray-400 mb-2 font-medium">
                  What to Do
                </div>
                <p className="text-sm text-gray-200 leading-relaxed">
                  {selectedReport.data?.executive_summary?.recommended_action ??
                    "No recommendation available."}
                </p>
                {selectedReport.data?.executive_summary?.next_steps && (
                  <p className="text-sm text-gray-400 leading-relaxed mt-3">
                    {selectedReport.data.executive_summary.next_steps}
                  </p>
                )}
              </div>
            </div>

            {/* Issues list */}
            {(() => {
              const anomalyList =
                selectedReport.data?.feature_2_anomalies?.anomaly_list ?? [];
              if (anomalyList.length === 0) return null;
              return (
                <div>
                  <div className="text-sm text-gray-400 mb-3 font-medium uppercase tracking-wider">
                    Issues Identified
                  </div>
                  <div className="space-y-3">
                    {anomalyList.map((anomaly: any, i: number) => {
                      const sev = (anomaly.severity ?? "LOW").toUpperCase();
                      const config =
                        severityConfig[sev as keyof typeof severityConfig] ??
                        severityConfig.LOW;
                      const SevIcon = config.icon;
                      return (
                        <div
                          key={anomaly.id ?? i}
                          className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-start gap-4"
                        >
                          <SevIcon
                            className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.color}`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-white">
                                {formatAnomalyType(anomaly.type ?? "")}
                              </span>
                              <Badge variant="outline">{config.label}</Badge>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              {anomaly.description}
                            </p>
                            {anomaly.affected_amounts?.[0] != null && (
                              <p className="text-xs text-gray-500 mt-1">
                                Amount:{" "}
                                {formatNaira(anomaly.affected_amounts[0])}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Recommended steps */}
            {(() => {
              const steps: string[] =
                selectedReport.data?.recommendations?.secondary_actions ?? [];
              if (steps.length === 0) return null;
              return (
                <div className="rounded-3xl bg-white/5 p-5 border border-white/10">
                  <div className="text-sm text-gray-400 mb-3 font-medium">
                    Recommended Steps
                  </div>
                  <ol className="space-y-2 text-sm text-gray-200 list-decimal pl-4">
                    {steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              );
            })()}
          </div>
        </FloatingCard>
      )}

      {pendingDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
          <div className="w-full max-w-lg rounded-3xl bg-[#0f172a] border border-white/10 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Delete report</h2>
                <p className="mt-2 text-sm text-gray-400">
                  This report will be permanently removed from your review
                  history.
                </p>
              </div>
              <button
                type="button"
                onClick={closeDeleteDialog}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="mt-6 space-y-4 text-sm text-gray-300">
              <p>
                Are you sure you want to delete report{" "}
                <span className="font-semibold text-white">
                  {pendingDeleteId.substring(0, 8).toUpperCase()}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteDialog}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteReport}
                disabled={deletingId === pendingDeleteId}
                className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400 disabled:opacity-60"
              >
                {deletingId === pendingDeleteId
                  ? "Deleting..."
                  : "Delete report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
