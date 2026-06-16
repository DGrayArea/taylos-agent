"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle, CheckCircle, Clock, User, Plus, Filter,
  ChevronRight, Calendar, Tag, Shield,
} from "lucide-react";
import { ComprehensiveAnalysis, Anomaly } from "@/lib/types";

interface CaseRow {
  id: string;
  anomaly_id: string;
  report_id: string | null;
  title: string;
  description: string;
  status: "open" | "in_review" | "resolved";
  severity: string;
  assignee: string | null;
  deadline: string | null;
  comments: Array<{ text: string; created_at: string; author: string }>;
  created_at: string;
  updated_at?: string;
}

interface ReportRow {
  id: string;
  created_at: string;
  data: ComprehensiveAnalysis;
}

interface Props {
  initialCases: CaseRow[];
  reports: ReportRow[];
}

const STATUS_CONFIG = {
  open: { label: "Open", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20", icon: AlertTriangle },
  in_review: { label: "In Review", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", icon: Clock },
  resolved: { label: "Resolved", color: "text-green-400", bg: "bg-green-400/10 border-green-400/20", icon: CheckCircle },
};

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "text-red-400",
  HIGH: "text-orange-400",
  MEDIUM: "text-yellow-400",
  LOW: "text-blue-400",
};

export function CasesList({ initialCases, reports }: Props) {
  const [cases, setCases] = useState<CaseRow[]>(initialCases);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ anomaly_id: "", report_id: "", title: "", description: "", severity: "MEDIUM", assignee: "" });
  const [isCreating, setIsCreating] = useState(false);

  const filtered = cases.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (severityFilter !== "all" && c.severity !== severityFilter) return false;
    return true;
  });

  // Get all anomalies from all reports for the create form dropdown
  const allAnomalies: Array<Anomaly & { reportId: string }> = reports.flatMap((r) =>
    (r.data?.feature_2_anomalies?.anomaly_list ?? []).map((a) => ({ ...a, reportId: r.id })),
  );

  const handleCreate = async () => {
    if (!createForm.anomaly_id || !createForm.title) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (data.case) {
        setCases((prev) => [data.case, ...prev]);
        setShowCreateModal(false);
        setCreateForm({ anomaly_id: "", report_id: "", title: "", description: "", severity: "MEDIUM", assignee: "" });
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Case Management</h1>
          <p className="text-gray-400 text-sm">
            Track and resolve anomalies through structured cases with deadlines and team assignment.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-gold)] text-[var(--color-navy)] font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Open New Case
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {(["open", "in_review", "resolved"] as const).map((s) => {
          const cfg = STATUS_CONFIG[s];
          const count = cases.filter((c) => c.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
              className={`rounded-2xl p-5 border transition-all text-left ${statusFilter === s ? "bg-white/10 border-white/20" : "bg-white/5 border-white/10 hover:bg-white/8"}`}
            >
              <cfg.icon className={`w-5 h-5 mb-3 ${cfg.color}`} />
              <div className={`text-2xl font-bold ${cfg.color}`}>{count}</div>
              <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{cfg.label}</div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Filter className="w-4 h-4" />
          Filter:
        </div>
        {["all", "open", "in_review", "resolved"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${statusFilter === s ? "bg-white/15 text-white" : "text-gray-400 hover:text-white"}`}
          >
            {s === "all" ? "All Status" : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG].label}
          </button>
        ))}
        <div className="w-px bg-white/10 mx-1" />
        {["all", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${severityFilter === sev ? "bg-white/15 text-white" : "text-gray-400 hover:text-white"}`}
          >
            {sev === "all" ? "All Severity" : sev}
          </button>
        ))}
      </div>

      {/* Cases List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white/5 border border-white/10 p-16 text-center">
            <Shield className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No cases found.</p>
            <p className="text-gray-600 text-sm mt-1">
              Cases are created from detected anomalies. Open a new case to begin tracking.
            </p>
          </div>
        ) : (
          filtered.map((c) => {
            const cfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.open;
            return (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="block rounded-2xl bg-white/5 border border-white/10 p-5 hover:bg-white/8 hover:border-white/20 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs border font-medium ${cfg.bg} ${cfg.color}`}
                      >
                        {cfg.label}
                      </span>
                      <span className={`text-xs font-bold ${SEVERITY_COLORS[c.severity] ?? "text-gray-400"}`}>
                        {c.severity}
                      </span>
                      <span className="text-xs text-gray-600 font-mono">#{c.id.slice(0, 8)}</span>
                    </div>
                    <h3 className="font-semibold text-white mb-1 truncate">{c.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-1">{c.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
                      {c.assignee && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {c.assignee}
                        </span>
                      )}
                      {c.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due {new Date(c.deadline).toLocaleDateString("en-GB")}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {c.comments?.length ?? 0} comments
                      </span>
                      <span>
                        {new Date(c.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors flex-shrink-0 mt-1" />
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-charcoal)] border border-white/15 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold mb-5">Open New Case</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">Anomaly</label>
                <select
                  value={createForm.anomaly_id}
                  onChange={(e) => {
                    const anom = allAnomalies.find((a) => a.id === e.target.value);
                    setCreateForm((p) => ({
                      ...p,
                      anomaly_id: e.target.value,
                      report_id: anom?.reportId ?? "",
                      title: anom ? `[${anom.type}] ${anom.description.slice(0, 60)}` : p.title,
                      severity: anom?.severity ?? "MEDIUM",
                    }));
                  }}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-gold)]/50"
                >
                  <option value="">Select an anomaly...</option>
                  {allAnomalies.map((a) => (
                    <option key={a.id} value={a.id}>
                      [{a.severity}] {a.type} — {a.description.slice(0, 50)}
                    </option>
                  ))}
                  <option value="manual">Manual (no linked anomaly)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">Title</label>
                <input
                  value={createForm.title}
                  onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Case title..."
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-gold)]/50"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Additional context..."
                  rows={3}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-gold)]/50 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">Severity</label>
                  <select
                    value={createForm.severity}
                    onChange={(e) => setCreateForm((p) => ({ ...p, severity: e.target.value }))}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-gold)]/50"
                  >
                    {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">Assignee</label>
                  <input
                    value={createForm.assignee}
                    onChange={(e) => setCreateForm((p) => ({ ...p, assignee: e.target.value }))}
                    placeholder="Name or email..."
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-gold)]/50"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-white/10 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isCreating || !createForm.title || (!createForm.anomaly_id)}
                  className="flex-1 px-4 py-2 rounded-xl bg-[var(--color-gold)] text-[var(--color-navy)] font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  {isCreating ? "Creating..." : "Open Case"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
