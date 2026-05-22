"use client";

import { useMemo, useState } from "react";
import { FloatingCard } from "@/components/ui/FloatingCard";
import { Badge } from "@/components/ui/Badge";
import { Download, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { formatNaira, getDocumentNamesFromAnalysis } from "@/lib/utils";

interface ReportRow {
  id: string;
  created_at: string;
  date: string;
  documents: number;
  issues: number;
  status: string;
  data: any;
}

interface ReportHistoryTableProps {
  history: ReportRow[];
}

export function ReportHistoryTable({ history }: ReportHistoryTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const rows = history || [];

  const selectedReport = useMemo(
    () => rows.find((row) => row.id === expandedId),
    [rows, expandedId],
  );

  return (
    <div className="space-y-4">
      <FloatingCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-gray-500 tracking-wider">
                <th className="p-4 font-medium">Report ID</th>
                <th className="p-4 font-medium">Processed</th>
                <th className="p-4 font-medium">Documents</th>
                <th className="p-4 font-medium">Issues</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-4 font-medium text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[var(--color-gold)]" />
                    {row.id.substring(0, 8)}...
                  </td>
                  <td className="p-4 text-sm text-gray-300">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="p-4 text-sm text-gray-300">{row.documents}</td>
                  <td className="p-4 text-sm">
                    {row.issues > 0 ? (
                      <span className="text-[var(--color-critical)] font-bold">
                        {row.issues} detected
                      </span>
                    ) : (
                      <span className="text-[var(--color-success)]">
                        All clear
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <Badge variant="outline">{row.status}</Badge>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      className="text-[var(--color-gold-light)] hover:text-white transition-colors p-2 inline-flex items-center gap-2"
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
                      {expandedId === row.id ? "Hide" : "View"}
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    No analysis history found. Upload documents to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </FloatingCard>

      {selectedReport && (
        <FloatingCard className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="text-xs uppercase tracking-[0.24em] text-gray-500">
                Selected report
              </div>
              <div className="text-lg font-semibold">{selectedReport.id}</div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-white/5 p-4">
                <div className="text-sm text-gray-400">Documents</div>
                <div className="mt-2 text-xl font-semibold">
                  {selectedReport.documents}
                </div>
              </div>
              <div className="rounded-3xl bg-white/5 p-4">
                <div className="text-sm text-gray-400">Issues</div>
                <div className="mt-2 text-xl font-semibold">
                  {selectedReport.issues}
                </div>
              </div>
              <div className="rounded-3xl bg-white/5 p-4">
                <div className="text-sm text-gray-400">Processed</div>
                <div className="mt-2 text-xl font-semibold">
                  {new Date(selectedReport.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white/5 p-4 border border-white/10">
              <div className="text-sm text-gray-400 mb-2">
                Documents checked
              </div>
              <div className="flex flex-wrap gap-2">
                {getDocumentNamesFromAnalysis(selectedReport.data).length >
                0 ? (
                  getDocumentNamesFromAnalysis(selectedReport.data).map(
                    (doc) => (
                      <span
                        key={doc}
                        className="px-3 py-1 rounded-full bg-black/30 text-sm text-white"
                      >
                        {doc}
                      </span>
                    ),
                  )
                ) : (
                  <span className="text-sm text-gray-300">
                    Document names were not available for this report.
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
              <div className="rounded-3xl bg-[var(--color-navy)]/80 p-4 border border-white/10">
                <div className="text-sm text-gray-400">Executive summary</div>
                <p className="mt-3 text-sm text-gray-200 leading-relaxed">
                  {selectedReport.data?.executive_summary?.finding ??
                    "No summary available."}
                </p>
              </div>
              <div className="rounded-3xl bg-[var(--color-navy)]/80 p-4 border border-white/10">
                <div className="text-sm text-gray-400">Recommended action</div>
                <p className="mt-3 text-sm text-gray-200 leading-relaxed">
                  {selectedReport.data?.executive_summary?.recommended_action ??
                    "No recommendation available."}
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-black/40 p-4 overflow-x-auto">
              <div className="flex items-center justify-between mb-3 text-sm text-gray-400">
                <span>Full stored analysis payload</span>
                <span className="inline-flex items-center gap-2 text-[var(--color-gold)]">
                  <Download className="w-4 h-4" /> JSON
                </span>
              </div>
              <pre className="whitespace-pre-wrap break-words text-xs text-gray-200">
                {JSON.stringify(selectedReport.data, null, 2)}
              </pre>
            </div>
          </div>
        </FloatingCard>
      )}
    </div>
  );
}
