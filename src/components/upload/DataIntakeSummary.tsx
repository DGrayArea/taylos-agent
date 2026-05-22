"use client";

import { FloatingCard } from "../ui/FloatingCard";
import { mockIntakeSummary } from "@/lib/mockData";
import { useUpload } from "./UploadContext";

export function DataIntakeSummary() {
  const { latestAnalysis } = useUpload();

  const summaryItems = latestAnalysis
    ? [
        {
          label: "Documents",
          value: latestAnalysis.analysis_metadata.documents_processed,
          subtext: "Files ingested for this run",
        },
        {
          label: "Transactions",
          value: latestAnalysis.analysis_metadata.total_transactions_analyzed,
          subtext: "Total transactions reviewed",
        },
        {
          label: "Anomalies",
          value: latestAnalysis.feature_2_anomalies.total_anomalies_found,
          subtext: "Suspicious items detected",
        },
        {
          label: "Confidence",
          value: `${Math.round(latestAnalysis.analysis_metadata.data_quality_score * 100)}%`,
          subtext: "Data quality score",
        },
      ]
    : mockIntakeSummary;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-4 flex items-center">
        <span className="w-1.5 h-6 bg-[var(--color-gold)] rounded-full mr-3 shadow-[var(--shadow-glow)]"></span>
        Data Intake Summary
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryItems.map((item, i) => (
          <FloatingCard
            key={i}
            delay={0.2 + i * 0.1}
            className="p-5 relative overflow-hidden group"
          >
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-[var(--color-gold)]/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
            <div className="text-3xl font-bold text-white mb-1">
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
