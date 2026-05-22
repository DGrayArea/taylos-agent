"use client";

import { FloatingCard } from "../ui/FloatingCard";
import { AlertTriangle, ShieldAlert, Info, AlertCircle, FileSearch } from "lucide-react";

interface AnomalyOverviewProps {
  stats?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    totalRecords?: number;
    documentCount?: number;
    reportDate?: string;
  } | null;
}

export function AnomalyOverview({ stats }: AnomalyOverviewProps) {
  if (!stats) {
    return (
      <div className="mb-8 flex flex-col items-center justify-center py-16 rounded-2xl border border-white/10 bg-white/[0.02] text-center">
        <FileSearch className="w-12 h-12 text-gray-500 mb-4" />
        <p className="text-gray-400 text-base font-medium">No documents reviewed yet</p>
        <p className="text-gray-500 text-sm mt-1">
          Upload a document from the <span className="text-[var(--color-gold-light)]">Upload Documents</span> page to see your findings here.
        </p>
      </div>
    );
  }

  const total = stats.critical + stats.high + stats.medium + stats.low;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <span className="w-1.5 h-8 bg-[var(--color-critical)] rounded-full mr-3 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
          {total > 0 ? `${total} Issue${total !== 1 ? "s" : ""} Detected` : "No Issues Found"}
        </h2>
        {stats.totalRecords != null && stats.totalRecords > 0 && (
          <span className="text-gray-400 text-sm">
            From {stats.totalRecords.toLocaleString()} records reviewed
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <FloatingCard className="border-t-4 border-t-[var(--color-critical)] bg-gradient-to-b from-[var(--color-critical)]/10 to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium text-gray-400 mb-1">Critical / Fraud</div>
              <div className="text-4xl font-bold text-white">{stats.critical}</div>
            </div>
            <ShieldAlert className="w-8 h-8 text-[var(--color-critical)] opacity-80" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Requires immediate action</p>
        </FloatingCard>

        <FloatingCard className="border-t-4 border-t-[var(--color-warning)] bg-gradient-to-b from-[var(--color-warning)]/10 to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium text-gray-400 mb-1">High Priority</div>
              <div className="text-4xl font-bold text-white">{stats.high}</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-[var(--color-warning)] opacity-80" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Review within 24 hours</p>
        </FloatingCard>

        <FloatingCard className="border-t-4 border-t-[var(--color-gold)] bg-gradient-to-b from-[var(--color-gold)]/10 to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium text-gray-400 mb-1">Medium</div>
              <div className="text-4xl font-bold text-white">{stats.medium}</div>
            </div>
            <AlertCircle className="w-8 h-8 text-[var(--color-gold)] opacity-80" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Schedule for review</p>
        </FloatingCard>

        <FloatingCard className="border-t-4 border-t-[var(--color-success)] bg-gradient-to-b from-[var(--color-success)]/10 to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium text-gray-400 mb-1">Low / Informational</div>
              <div className="text-4xl font-bold text-white">{stats.low}</div>
            </div>
            <Info className="w-8 h-8 text-[var(--color-success)] opacity-80" />
          </div>
          <p className="text-xs text-gray-500 mt-2">No immediate action needed</p>
        </FloatingCard>
      </div>
    </div>
  );
}
