"use client";

import { useState } from "react";
import { FloatingCard } from "../ui/FloatingCard";
import { Badge } from "../ui/Badge";
import { ChevronDown, ChevronUp, AlertCircle, FileSearch } from "lucide-react";
import { InvestigationPanel } from "../investigation/InvestigationPanel";
import { AnimatePresence } from "framer-motion";
import { formatNaira } from "@/lib/utils";

import { Anomaly } from "@/lib/types";

interface AnomalyListProps {
  anomalies?: Anomaly[];
}

// Human-readable severity labels for financial staff
const severityLabels: Record<string, string> = {
  CRITICAL: "Critical",
  HIGH: "High Priority",
  MEDIUM: "Medium",
  LOW: "Low",
  INFORMATIONAL: "For Information",
};

// Human-readable type labels — replace technical codes with plain English
function formatAnomalyType(type: string): string {
  const labels: Record<string, string> = {
    DUPLICATE_TRANSACTION: "Duplicate Payment",
    DUPLICATE_CHARGE: "Duplicate Charge",
    UNUSUAL_PATTERN: "Unusual Activity",
    MISSING_RECEIPT: "Missing Receipt",
    SYSTEM_SYNC_DELAY: "Processing Delay",
    FRAUD: "Possible Fraud",
    BILLING_ERROR: "Billing Error",
    CUSTOMER_ERROR: "Entry Error",
    SYSTEM_GLITCH: "System Delay",
  };
  return labels[type.toUpperCase().replace(/ /g, "_")] ?? type;
}

export function AnomalyList({ anomalies = [] }: AnomalyListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    anomalies[0]?.id || null,
  );

  if (anomalies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-white/10 bg-white/[0.02] text-center">
        <FileSearch className="w-10 h-10 text-gray-500 mb-4" />
        <p className="text-gray-400 text-base font-medium">No issues to display</p>
        <p className="text-gray-500 text-sm mt-1">
          Once you upload and review documents, any issues found will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {anomalies.map((anomaly, i) => {
        const isExpanded = expandedId === anomaly.id;
        const displayType = formatAnomalyType(anomaly.type);
        const displaySeverity =
          severityLabels[anomaly.severity] ?? anomaly.severity;

        return (
          <FloatingCard
            key={anomaly.id}
            delay={0.3 + i * 0.1}
            className="p-0 overflow-hidden cursor-pointer group"
            onClick={() => setExpandedId(isExpanded ? null : anomaly.id)}
          >
            {/* Header / Summary Row */}
            <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-start md:items-center gap-4 md:gap-6 w-full md:w-1/2">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 group-hover:border-[var(--color-gold)]/30 transition-colors flex-shrink-0 mt-1 md:mt-0">
                  <AlertCircle className="w-5 h-5 text-gray-400 group-hover:text-[var(--color-gold)] transition-colors" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-base font-bold text-white mb-1 group-hover:text-[var(--color-gold-light)] transition-colors truncate">
                    {displayType}
                  </div>
                  <div className="text-xs text-gray-400 line-clamp-2 md:line-clamp-none">
                    {anomaly.description}
                  </div>
                  {anomaly.related_documents?.length ? (
                    <div className="text-[11px] text-[var(--color-gold-light)] mt-1 truncate">
                      Document: {anomaly.related_documents.join(", ")}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 w-full md:w-1/2 border-t border-white/5 md:border-none pt-4 md:pt-0">
                <div className="text-left md:text-right hidden sm:block">
                  <div className="text-sm font-medium text-white mb-1">
                    {anomaly.affected_amounts && anomaly.affected_amounts.length > 0
                      ? formatNaira(anomaly.affected_amounts[0])
                      : "—"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {anomaly.first_occurrence
                      ? new Date(anomaly.first_occurrence).toLocaleDateString("en-GB")
                      : "Date unknown"}
                  </div>
                </div>

                <Badge
                  variant={anomaly.severity as any}
                  className="w-auto md:w-32 justify-center py-1 px-3 text-center text-xs md:text-sm whitespace-nowrap"
                >
                  {displaySeverity}
                </Badge>

                <div className="text-center w-16 flex-shrink-0 hidden xs:block">
                  <div className="text-sm font-bold text-white">
                    {anomaly.anomaly_score}
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase">
                    Risk Score
                  </div>
                </div>

                <div className="text-gray-500 flex-shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>
            </div>

            {/* Expandable Details */}
            <AnimatePresence>
              {isExpanded && (
                <div
                  className="px-5 pb-5 cursor-default"
                  onClick={(e) => e.stopPropagation()}
                >
                  <InvestigationPanel anomaly={anomaly} />
                </div>
              )}
            </AnimatePresence>
          </FloatingCard>
        );
      })}
    </div>
  );
}
