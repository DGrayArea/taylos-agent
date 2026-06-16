"use client";

import { useState } from "react";
import { FloatingCard } from "../ui/FloatingCard";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileDown,
  Loader2,
  FileText,
} from "lucide-react";
import { useUpload } from "./UploadContext";
import {
  formatNaira,
  getDocumentNamesFromAnalysis,
  exportAnomaliesToExcel,
} from "@/lib/utils";
import { AnalysisChartsPanel } from "@/components/charts/AnalysisCharts";
import { DocumentChat } from "@/components/chat/DocumentChat";
import { Table } from "lucide-react";

// Human-readable labels
const priorityLabels: Record<string, string> = {
  CRITICAL: "Critical — Act Now",
  HIGH: "High Priority",
  MEDIUM: "Medium",
  LOW: "Low",
  INFORMATIONAL: "For Your Information",
};

function formatAnomalyType(type: string): string {
  const labels: Record<string, string> = {
    DUPLICATE_TRANSACTION: "Duplicate Payment",
    DUPLICATE_CHARGE: "Duplicate Charge",
    UNUSUAL_PATTERN: "Unusual Activity",
    MISSING_RECEIPT: "Missing Receipt",
    SELF_APPROVAL: "Self-Approval Violation",
    GHOST_VENDOR: "Unrecognised Vendor",
    SPLIT_TRANSACTION: "Split Payment Pattern",
    OFFSHORE_TRANSFER: "Offshore Transfer",
    PAYROLL_ANOMALY: "Payroll Irregularity",
    MISSING_DOCUMENTATION: "Missing Documentation",
    VELOCITY_ANOMALY: "Unusual Volume",
    BILLING_ERROR: "Billing Error",
    CUSTOMER_ERROR: "Data Entry Error",
    SYSTEM_GLITCH: "System Delay",
  };
  return labels[type.toUpperCase().replace(/ /g, "_")] ?? type;
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

export function AnalysisReport() {
  const { latestAnalysis } = useUpload();
  const [showRawJson, setShowRawJson] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  if (!latestAnalysis) return null;

  const {
    analysis_metadata,
    executive_summary,
    feature_2_anomalies,
    recommendations,
    spending_by_category,
    monthly_trend,
  } = latestAnalysis;

  const documentNames = getDocumentNamesFromAnalysis(latestAnalysis);
  const priorityLabel =
    priorityLabels[executive_summary.priority] ?? executive_summary.priority;

  // ── Export PDF via API ─────────────────────────────────
  const handleExportPDF = async () => {
    setPdfLoading(true);
    setPdfError(null);
    try {
      const res = await fetch("/api/report/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis: latestAnalysis }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      a.download = `Taylos-Financial-Report-${dateStr}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Export PDF failed", err);
      setPdfError("PDF export failed. Try Export JSON or retry.");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <section className="mt-10 space-y-6">
      {/* Header row */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Your Review Results</h2>
          <p className="text-gray-400 text-sm max-w-2xl">
            This report has been saved. Use the buttons below to export a
            formatted PDF report or the raw data.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="primary"
            className="flex items-center gap-2"
            onClick={handleExportPDF}
            disabled={pdfLoading}
          >
            {pdfLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            {pdfLoading ? "Generating PDF..." : "Export Anomalies (PDF)"}
          </Button>
          <Button
            variant="secondary"
            className="flex items-center gap-2"
            onClick={() =>
              exportAnomaliesToExcel(
                latestAnalysis,
                `Taylos-Anomalies-${new Date().toISOString().slice(0, 10)}.xlsx`,
              )
            }
          >
            <Table className="w-4 h-4" />
            Export Anomalies (Excel)
          </Button>
          <Button
            variant="secondary"
            className="flex items-center gap-2"
            onClick={() =>
              downloadJSON(
                latestAnalysis,
                `report-${new Date(analysis_metadata.analysis_date).toISOString().slice(0, 10)}.json`,
              )
            }
          >
            <FileText className="w-4 h-4" />
            Export Anomalies (JSON)
          </Button>
        </div>
      </div>
      {pdfError && (
        <p className="text-sm text-[var(--color-critical)]">{pdfError}</p>
      )}

      {/* Stat summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Documents", value: analysis_metadata.documents_processed },
          {
            label: "Records Checked",
            value: analysis_metadata.total_transactions_analyzed || "—",
          },
          {
            label: "Issues Found",
            value: feature_2_anomalies.total_anomalies_found,
            highlight: feature_2_anomalies.total_anomalies_found > 0,
          },
          {
            label: "Data Quality",
            value: analysis_metadata.data_quality_score
              ? `${Math.round(analysis_metadata.data_quality_score * 100)}%`
              : "—",
          },
        ].map((stat, i) => (
          <FloatingCard key={i} className="p-4">
            <div className="text-sm text-gray-400">{stat.label}</div>
            <div
              className={`text-2xl font-bold mt-1 ${stat.highlight ? "text-[var(--color-critical)]" : ""}`}
            >
              {stat.value}
            </div>
          </FloatingCard>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        {/* Left: executive summary */}
        <FloatingCard className="p-6 space-y-5">
          {documentNames.length > 0 && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-sm text-gray-400 mb-2">
                Documents Reviewed
              </div>
              <div className="flex flex-wrap gap-2">
                {documentNames.map((name) => (
                  <span
                    key={name}
                    className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-white"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-3">
            {[
              { label: "Priority Level", value: priorityLabel, colored: true },
              { label: "Confidence", value: executive_summary.confidence },
              {
                label: "Time to Complete",
                value: analysis_metadata.total_processing_time_seconds
                  ? `${analysis_metadata.total_processing_time_seconds}s`
                  : "—",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-2xl bg-[var(--color-navy)]/80 p-4 border border-white/10"
              >
                <div className="text-xs text-gray-400 mb-1">{item.label}</div>
                <div className="font-semibold text-sm text-white">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </FloatingCard>

        {/* Right: executive summary text */}
        <FloatingCard className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-[var(--color-gold)] font-semibold uppercase tracking-[0.24em] text-xs">
            <Sparkles className="w-4 h-4" /> Summary
          </div>
          <div className="text-base font-bold">{executive_summary.finding}</div>
          <p className="text-gray-300 text-sm leading-relaxed">
            {executive_summary.root_cause}
          </p>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              What to do
            </p>
            <div className="rounded-2xl bg-white/5 p-4 text-sm text-gray-200">
              {executive_summary.recommended_action}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Next steps
            </p>
            <div className="rounded-2xl bg-white/5 p-4 text-sm text-gray-200">
              {executive_summary.next_steps}
            </div>
          </div>
        </FloatingCard>
      </div>

      {/* Charts */}
      <AnalysisChartsPanel
        anomaliesBySeverity={feature_2_anomalies.anomalies_by_severity}
        spendingByCategory={spending_by_category}
        monthlyTrend={monthly_trend}
      />

      {/* Issues grid */}
      <div className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
        <FloatingCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-500">
                Issues Identified
              </div>
              <div className="text-xl font-bold">Key Findings</div>
            </div>
            <Badge variant="outline">
              {feature_2_anomalies.anomaly_list.length} Total
            </Badge>
          </div>
          <div className="space-y-3">
            {feature_2_anomalies.anomaly_list.slice(0, 4).map((anomaly) => (
              <div
                key={anomaly.id}
                className="rounded-2xl bg-white/5 p-4 border border-white/10"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-xs text-gray-400 capitalize">
                      {anomaly.category} &bull;{" "}
                      {anomaly.severity.charAt(0) +
                        anomaly.severity.slice(1).toLowerCase()}
                    </div>
                    <div className="text-sm font-semibold">
                      {formatAnomalyType(anomaly.type)}
                    </div>
                  </div>
                  <Badge variant="outline">
                    {anomaly.confidence}% confidence
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  {anomaly.description}
                </p>
                {anomaly.affected_amounts?.[0] != null && (
                  <p className="text-xs text-[var(--color-critical)] mt-1 font-medium">
                    Amount: {formatNaira(anomaly.affected_amounts[0])}
                  </p>
                )}
              </div>
            ))}
            {feature_2_anomalies.anomaly_list.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                No issues identified in these documents.
              </p>
            )}
          </div>
        </FloatingCard>

        <FloatingCard className="p-6 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-gray-500">
              Next Steps
            </div>
            <div className="text-xl font-bold">Recommended Actions</div>
          </div>
          {recommendations.secondary_actions.length > 0 ? (
            <ol className="space-y-3">
              {recommendations.secondary_actions.map((action, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-[var(--color-gold)]/20 text-[var(--color-gold)] text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {action}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-gray-500 italic">
              No additional actions required.
            </p>
          )}
          {recommendations.communication && (
            <div className="rounded-2xl bg-white/5 p-4 border border-white/10 mt-2">
              <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
                Who to Notify
              </div>
              <p className="text-sm text-gray-200">
                {recommendations.communication}
              </p>
            </div>
          )}
        </FloatingCard>
      </div>

      {/* Ask AI Chat Section */}
      <div className="mt-8">
        <DocumentChat analysisContext={latestAnalysis} />
      </div>

      {/* Raw JSON toggle — for technical users only */}
      <div className="text-right">
        <button
          className="text-xs text-gray-600 hover:text-gray-400 underline underline-offset-2 transition-colors"
          onClick={() => setShowRawJson((v) => !v)}
        >
          {showRawJson ? "Hide" : "Show"} raw report data
        </button>
      </div>
      {showRawJson && (
        <FloatingCard className="p-5 overflow-x-auto">
          <pre className="whitespace-pre-wrap break-words bg-black/40 p-4 rounded-2xl text-xs text-gray-300">
            {JSON.stringify(latestAnalysis, null, 2)}
          </pre>
        </FloatingCard>
      )}
    </section>
  );
}
