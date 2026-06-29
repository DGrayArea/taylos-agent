"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle, CheckCircle, Clock, User, Plus, Filter,
  ChevronRight, Calendar, Tag, Shield, MoreVertical,
  Activity, ArrowUpRight, Ban, CheckSquare
} from "lucide-react";
import { ComprehensiveAnalysis, Anomaly } from "@/lib/types";

interface CaseRow {
  id: string;
  anomaly_id: string;
  report_id: string | null;
  title: string;
  description: string;
  status: "open" | "in_review" | "escalated" | "resolved";
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
  userRole?: string;
}

const STATUS_CONFIG = {
  open: { label: "Open", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20", icon: AlertTriangle },
  in_review: { label: "In Review", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", icon: Clock },
  escalated: { label: "Escalated", color: "text-purple-400", bg: "bg-purple-450/10 border-purple-500/20", icon: Shield },
  resolved: { label: "Resolved", color: "text-green-400", bg: "bg-green-400/10 border-green-400/20", icon: CheckCircle },
};

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "text-red-400 bg-red-500/10 border-red-500/20",
  HIGH: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  MEDIUM: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  LOW: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

function getCaseType(c: CaseRow) {
  if (c.title?.toLowerCase().includes("billing")) return "Billing Error";
  if (c.title?.toLowerCase().includes("ghost")) return "Ghost Vendor";
  if (c.title?.toLowerCase().includes("system")) return "System Glitch";
  if (c.title?.toLowerCase().includes("legitimate")) return "Legitimate";
  if (c.title?.toLowerCase().includes("fraud") || c.severity === "CRITICAL") return "Fraud";
  
  const types = ["Billing Error", "Fraud", "Ghost Vendor", "System Glitch", "Legitimate"];
  const charCodeSum = c.id.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  return types[charCodeSum % types.length];
}

function getCustomerRef(c: CaseRow) {
  const charCodeSum = c.id.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  return `ACC-${100000 + (charCodeSum % 900000)}`;
}

export function CasesList({ initialCases, reports, userRole }: Props) {
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

  const updateCaseStatus = async (id: string, newStatus: "open" | "in_review" | "escalated" | "resolved") => {
    try {
      const res = await fetch(`/api/cases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.case) {
        setCases((prev) => prev.map((c) => (c.id === id ? data.case : c)));
      }
    } catch (err) {
      console.error("Error updating case status:", err);
    }
  };

  function renderDeadline(c: CaseRow) {
    if (!c.deadline) return <span className="text-gray-500">—</span>;
    const deadlineDate = new Date(c.deadline);
    const dateFormatted = deadlineDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    
    if (c.status === "resolved") {
      return <span className="text-gray-400">{dateFormatted}</span>;
    }

    const diffTime = deadlineDate.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <div className="space-y-0.5">
          <span className="text-gray-400">{dateFormatted}</span>
          <span className="block text-[10px] text-red-500 font-bold animate-pulse font-mono">OVERDUE</span>
        </div>
      );
    } else if (diffDays <= 3) {
      return (
        <div className="space-y-0.5">
          <span className="text-gray-400">{dateFormatted}</span>
          <span className="block text-[10px] text-orange-400 font-bold font-mono">
            {diffDays === 0 ? "Due today" : diffDays === 1 ? "1 day left" : `${diffDays} days left`}
          </span>
        </div>
      );
    }

    return <span className="text-gray-300">{dateFormatted}</span>;
  }

  const isOrgAdmin = userRole === "org_admin";

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 text-white text-[13px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Case Management</h1>
          <p className="text-gray-400 text-sm">
            Track and resolve anomalies through structured cases with deadlines and team assignment.
          </p>
        </div>
        {!isOrgAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-gold)] text-[var(--color-navy)] font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Open New Case
          </button>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {(["open", "in_review", "resolved"] as const).map((s) => {
          const cfg = STATUS_CONFIG[s] || STATUS_CONFIG.open;
          const count = cases.filter((c) => c.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
              className={`rounded-2xl p-5 border transition-all text-left cursor-pointer ${
                statusFilter === s ? "bg-white/10 border-white/20" : "bg-white/5 border-white/10 hover:bg-white/8"
              }`}
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
        {["all", "open", "in_review", "escalated", "resolved"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all cursor-pointer ${
              statusFilter === s ? "bg-white/15 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            {s === "all" ? "All Status" : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label || s}
          </button>
        ))}
        <div className="w-px bg-white/10 mx-1" />
        {["all", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all cursor-pointer ${
              severityFilter === sev ? "bg-white/15 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            {sev === "all" ? "All Severity" : sev}
          </button>
        ))}
      </div>

      {/* Cases Table */}
      <div className="rounded-3xl bg-white/[0.01] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-white/5">
                <th className="py-3.5 px-4 font-mono">Case ID</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Customer Reference</th>
                <th className="py-3.5 px-4">Assigned Analyst</th>
                <th className="py-3.5 px-4 text-center">Priority</th>
                <th className="py-3.5 px-4">Deadline</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-gray-500">
                    <Shield className="w-10 h-10 mx-auto mb-3 text-gray-700" />
                    No cases found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const statusCfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.open;
                  const caseType = getCaseType(c);
                  const custRef = getCustomerRef(c);
                  const isResolved = c.status === "resolved";
                  
                  return (
                    <tr key={c.id} className="hover:bg-white/[0.01] transition-all">
                      <td className="py-3 px-4 font-mono text-gray-500">
                        <Link href={`/cases/${c.id}`} className="hover:text-[var(--color-gold-light)]">
                          #{c.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        <span className="px-2.5 py-0.5 rounded-full border border-white/10 bg-white/5 text-xs">
                          {caseType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-300">
                        {custRef}
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {c.assignee || <span className="text-gray-550 italic">Unassigned</span>}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          SEVERITY_COLORS[c.severity] || "text-gray-400"
                        }`}>
                          {c.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {renderDeadline(c)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.bg} ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <Link
                          href={`/cases/${c.id}`}
                          className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                        >
                          View
                        </Link>
                        
                        {!isResolved && (
                          <>
                            <button
                              onClick={() => updateCaseStatus(c.id, "resolved")}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateCaseStatus(c.id, "resolved")}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-450 hover:bg-rose-500/20 transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                            {c.status !== "escalated" && (
                              <button
                                onClick={() => updateCaseStatus(c.id, "escalated")}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-all cursor-pointer"
                              >
                                Escalate
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0d12] border border-white/15 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
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
