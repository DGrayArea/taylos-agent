"use client";

import { useState } from "react";
import { FloatingCard } from "../ui/FloatingCard";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { ChevronDown, ChevronUp, Sparkles, FileText } from "lucide-react";
import { useUpload } from "./UploadContext";
import { formatNaira, getDocumentNamesFromAnalysis } from "@/lib/utils";

export function AnalysisReport() {
  const { latestAnalysis } = useUpload();
  const [showFullJson, setShowFullJson] = useState(false);
  if (!latestAnalysis) return null;

  const {
    analysis_metadata,
    executive_summary,
    feature_2_anomalies,
    recommendations,
  } = latestAnalysis;
  const documentNames = getDocumentNamesFromAnalysis(latestAnalysis);

  return (
    <section className="mt-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Latest Analysis Report</h2>
          <p className="text-gray-400 text-sm md:text-base max-w-2xl">
            The full report has been saved to history and is available for
            review below. The dashboard shows the most recent analysis summary
            for the selected documents.
          </p>
        </div>
        <Button
          variant="secondary"
          className="flex items-center gap-2"
          onClick={() => setShowFullJson((prev) => !prev)}
        >
          {showFullJson ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          {showFullJson ? "Hide full JSON" : "Show full JSON"}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <FloatingCard className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm uppercase tracking-[0.24em] text-gray-500">
                Analysis Date
              </div>
              <div className="text-lg font-semibold">
                {new Date(analysis_metadata.analysis_date).toLocaleString()}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm uppercase tracking-[0.24em] text-gray-500">
                Processing Time
              </div>
              <div className="text-lg font-semibold">
                {analysis_metadata.total_processing_time_seconds}s
              </div>
            </div>
          </div>
          {documentNames.length > 0 && (
            <div className="mt-4 p-4 rounded-3xl bg-white/5 border border-white/10">
              <div className="text-sm text-gray-400 mb-2">
                Documents checked
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-white">
                {documentNames.map((name) => (
                  <span
                    key={name}
                    className="px-3 py-1 rounded-full bg-white/5 border border-white/10"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-3xl bg-white/5 p-4">
              <div className="text-sm text-gray-400">Documents</div>
              <div className="text-2xl font-bold">
                {analysis_metadata.documents_processed}
              </div>
            </div>
            <div className="rounded-3xl bg-white/5 p-4">
              <div className="text-sm text-gray-400">Transactions</div>
              <div className="text-2xl font-bold">
                {analysis_metadata.total_transactions_analyzed}
              </div>
            </div>
            <div className="rounded-3xl bg-white/5 p-4">
              <div className="text-sm text-gray-400">Anomalies</div>
              <div className="text-2xl font-bold">
                {feature_2_anomalies.total_anomalies_found}
              </div>
            </div>
            <div className="rounded-3xl bg-white/5 p-4">
              <div className="text-sm text-gray-400">Data Quality</div>
              <div className="text-2xl font-bold">
                {Math.round(analysis_metadata.data_quality_score * 100)}%
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-[var(--color-navy)]/80 p-4 border border-white/10">
              <div className="text-sm text-gray-400">Priority</div>
              <div className="mt-2 font-semibold text-white">
                {executive_summary.priority}
              </div>
            </div>
            <div className="rounded-3xl bg-[var(--color-navy)]/80 p-4 border border-white/10">
              <div className="text-sm text-gray-400">Confidence</div>
              <div className="mt-2 font-semibold text-white">
                {executive_summary.confidence}
              </div>
            </div>
            <div className="rounded-3xl bg-[var(--color-navy)]/80 p-4 border border-white/10">
              <div className="text-sm text-gray-400">Status</div>
              <Badge variant="outline">Complete</Badge>
            </div>
          </div>
        </FloatingCard>

        <FloatingCard className="p-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[var(--color-gold)] font-semibold uppercase tracking-[0.24em] text-xs">
              <Sparkles className="w-4 h-4" /> Executive Summary
            </div>
            <div className="text-lg font-bold">{executive_summary.finding}</div>
            <p className="text-gray-300 leading-relaxed">
              {executive_summary.root_cause}
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Recommended action:</p>
              <div className="rounded-3xl bg-white/5 p-4 text-sm text-gray-200">
                {executive_summary.recommended_action}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Next steps:</p>
              <div className="rounded-3xl bg-white/5 p-4 text-sm text-gray-200">
                {executive_summary.next_steps}
              </div>
            </div>
          </div>
        </FloatingCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.95fr] mt-6">
        <FloatingCard className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.24em] text-gray-500">
                Anomaly detail
              </div>
              <div className="text-xl font-bold">Top findings</div>
            </div>
            <Badge variant="outline">
              {feature_2_anomalies.anomaly_list.length} Total
            </Badge>
          </div>

          <div className="space-y-3">
            {feature_2_anomalies.anomaly_list.slice(0, 3).map((anomaly) => (
              <div
                key={anomaly.id}
                className="rounded-3xl bg-white/5 p-4 border border-white/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-gray-400">
                      {anomaly.category} • {anomaly.severity}
                    </div>
                    <div className="text-base font-semibold">
                      {anomaly.type}
                    </div>
                  </div>
                  <Badge variant="outline">{anomaly.confidence}%</Badge>
                </div>
                <p className="mt-3 text-sm text-gray-300">
                  {anomaly.description}
                </p>
              </div>
            ))}
          </div>
        </FloatingCard>

        <FloatingCard className="p-6 space-y-5">
          <div>
            <div className="text-sm uppercase tracking-[0.24em] text-gray-500">
              Recommendations
            </div>
            <div className="text-xl font-bold mt-2">Action plan</div>
          </div>
          <ul className="space-y-3 text-sm text-gray-300 list-disc pl-5">
            {recommendations.secondary_actions.map((action, index) => (
              <li key={index}>{action}</li>
            ))}
          </ul>
          <div className="rounded-3xl bg-white/5 p-4 text-sm text-gray-200 border border-white/10">
            <div className="font-semibold text-white">
              Communication guidance
            </div>
            <p className="mt-2">{recommendations.communication}</p>
          </div>
        </FloatingCard>
      </div>

      {showFullJson && (
        <FloatingCard className="mt-6 p-5 overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-400">
              Complete analysis payload
            </div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[var(--color-gold)]">
              <FileText className="w-4 h-4" /> JSON snapshot
            </div>
          </div>
          <pre className="whitespace-pre-wrap break-words bg-black/40 p-4 rounded-3xl text-xs text-gray-200">
            {JSON.stringify(latestAnalysis, null, 2)}
          </pre>
        </FloatingCard>
      )}
    </section>
  );
}
