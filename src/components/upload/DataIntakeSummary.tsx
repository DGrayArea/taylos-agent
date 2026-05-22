"use client";

import { FloatingCard } from "../ui/FloatingCard";
import { useUpload } from "./UploadContext";

export function DataIntakeSummary() {
  const { latestAnalysis } = useUpload();
  if (!latestAnalysis) return null;

  const meta = latestAnalysis.analysis_metadata;
  const anomalyCount = latestAnalysis.feature_2_anomalies.total_anomalies_found;

  const summaryItems = [
    {
      label: "Documents",
      value: meta.documents_processed,
      subtext: "Files submitted for review",
    },
    {
      label: "Records Checked",
      value: meta.total_transactions_analyzed || "—",
      subtext: "Entries reviewed for issues",
    },
    {
      label: "Issues Found",
      value: anomalyCount,
      subtext: anomalyCount === 0 ? "Nothing suspicious detected" : "See details below",
      highlight: anomalyCount > 0,
    },
    {
      label: "Data Quality",
      value: meta.data_quality_score
        ? `${Math.round(meta.data_quality_score * 100)}%`
        : "—",
      subtext: "Based on completeness of records",
    },
  ];

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-4 flex items-center">
        <span className="w-1.5 h-6 bg-[var(--color-gold)] rounded-full mr-3 shadow-[var(--shadow-glow)]" />
        Review Summary
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryItems.map((item, i) => (
          <FloatingCard
            key={i}
            delay={0.2 + i * 0.1}
            className="p-5 relative overflow-hidden group"
          >
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-[var(--color-gold)]/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
            <div className={`text-3xl font-bold mb-1 ${item.highlight ? "text-[var(--color-critical)]" : "text-white"}`}>
              {item.value}
            </div>
            <div className="text-sm font-medium text-[var(--color-gold-light)] mb-0.5">
              {item.label}
            </div>
            <div className="text-xs text-gray-500">{item.subtext}</div>
          </FloatingCard>
        ))}
      </div>
    </div>
  );
}
