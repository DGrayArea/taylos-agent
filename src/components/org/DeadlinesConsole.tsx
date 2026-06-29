"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  AlertTriangle,
  Clock,
  Shield,
  ArrowRight,
  User,
  Calendar,
  MoreVertical,
  Eye,
  RefreshCw,
  TrendingUp,
  UserCheck
} from "lucide-react";

interface CaseRow {
  id: string;
  anomaly_id: string;
  title: string;
  status: "open" | "in_review" | "escalated" | "resolved";
  severity: string;
  assignee: string | null;
  deadline: string | null;
  created_at: string;
  updated_at?: string;
}

interface DeadlinesConsoleProps {
  orgId: string;
  orgName: string;
}

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

export function DeadlinesConsole({ orgId, orgName }: DeadlinesConsoleProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [filter, setFilter] = useState<"all" | "overdue" | "today" | "week" | "resolved">("all");
  const [reassignTarget, setReassignTarget] = useState<CaseRow | null>(null);
  const [newAssignee, setNewAssignee] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("org_id", orgId)
        .order("deadline", { ascending: true });

      if (data) {
        setCases(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  const handleEscalate = async (id: string) => {
    try {
      await fetch(`/api/cases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "escalated" }),
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignTarget || !newAssignee.trim()) return;

    try {
      await fetch(`/api/cases/${reassignTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignee: newAssignee.trim() }),
      });
      setReassignTarget(null);
      setNewAssignee("");
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Calculations for remaining days
  const getDaysRemainingInfo = (c: CaseRow) => {
    if (!c.deadline) return { days: 999, text: "No deadline", style: "text-gray-400" };
    
    const deadlineDate = new Date(c.deadline);
    const diffTime = deadlineDate.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (c.status === "resolved") {
      return { days: diffDays, text: "Resolved", style: "text-emerald-450" };
    }

    if (diffDays < 0) {
      return { days: diffDays, text: "OVERDUE", style: "text-red-500 animate-pulse font-bold flex items-center gap-1" };
    } else if (diffDays <= 2) {
      return { days: diffDays, text: `${diffDays === 0 ? "Due today" : diffDays === 1 ? "1 day left" : `${diffDays} days left`}`, style: "text-red-400 font-bold" };
    } else if (diffDays <= 6) {
      return { days: diffDays, text: `${diffDays} days left`, style: "text-amber-400 font-medium" };
    }
    return { days: diffDays, text: `${diffDays} days left`, style: "text-emerald-400" };
  };

  // Scoped count stats for summary bar
  const overdueCount = cases.filter(c => {
    if (c.status === "resolved" || !c.deadline) return false;
    return new Date(c.deadline).getTime() < new Date().getTime();
  }).length;

  const dueTodayCount = cases.filter(c => {
    if (c.status === "resolved" || !c.deadline) return false;
    const diffDays = Math.ceil((new Date(c.deadline).getTime() - new Date().getTime()) / 86400000);
    return diffDays === 0;
  }).length;

  const dueThisWeekCount = cases.filter(c => {
    if (c.status === "resolved" || !c.deadline) return false;
    const diffDays = Math.ceil((new Date(c.deadline).getTime() - new Date().getTime()) / 86400000);
    return diffDays > 0 && diffDays <= 7;
  }).length;

  const onTrackCount = cases.filter(c => {
    if (c.status === "resolved") return false;
    if (!c.deadline) return true;
    const diffDays = Math.ceil((new Date(c.deadline).getTime() - new Date().getTime()) / 86400000);
    return diffDays > 7;
  }).length;

  // Row filters
  const filteredCases = cases.filter((c) => {
    const info = getDaysRemainingInfo(c);
    if (filter === "resolved") return c.status === "resolved";
    if (filter === "overdue") return c.status !== "resolved" && info.days < 0;
    if (filter === "today") return c.status !== "resolved" && info.days === 0;
    if (filter === "week") return c.status !== "resolved" && info.days > 0 && info.days <= 7;
    return true;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 text-[13px] text-white">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-[var(--color-gold-light)] uppercase tracking-wider mb-2">
            <Clock className="w-3.5 h-3.5" />
            WORKSPACE: {orgName.toUpperCase()}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Regulatory Deadlines
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Track and monitor key deadline countdowns across organization anomaly cases to maintain compliance.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-3.5 py-1.5 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:border-white/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer bg-white/5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reload List
        </button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Overdue", val: overdueCount, style: "border-red-500/30 bg-red-500/5 text-red-400" },
          { label: "Due Today", val: dueTodayCount, style: "border-orange-500/30 bg-orange-500/5 text-orange-400" },
          { label: "Due This Week", val: dueThisWeekCount, style: "border-amber-500/30 bg-amber-500/5 text-amber-400" },
          { label: "On Track", val: onTrackCount, style: "border-emerald-550/30 bg-emerald-500/5 text-emerald-455" }
        ].map((card, i) => (
          <div key={i} className={`p-4 border rounded-2xl flex flex-col justify-between ${card.style}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">{card.label}</span>
            <span className="text-2xl font-bold mt-1.5">{card.val}</span>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2.5 overflow-x-auto pb-1.5">
        {(["all", "overdue", "today", "week", "resolved"] as const).map((opt) => (
          <button
            key={opt}
            onClick={() => setFilter(opt)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer capitalize ${
              filter === opt
                ? "bg-white/10 border-white/20 text-white"
                : "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {opt === "all" ? "All Deadlines" : opt.replace("week", "Due This Week").replace("today", "Due Today")}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-5 md:p-6 shadow-2xl space-y-4">
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-white/5">
                <th className="py-3.5 px-4 font-mono">Case ID</th>
                <th className="py-3.5 px-4">Case Type</th>
                <th className="py-3.5 px-4">Assigned To</th>
                <th className="py-3.5 px-4">Opened Date</th>
                <th className="py-3.5 px-4">Deadline</th>
                <th className="py-3.5 px-4">Days Remaining</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500 font-mono animate-pulse">
                    LOADING TRACKING DATABASE...
                  </td>
                </tr>
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    No deadlines matching criteria.
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => {
                  const type = getCaseType(c);
                  const info = getDaysRemainingInfo(c);
                  
                  return (
                    <tr key={c.id} className="hover:bg-white/[0.01] transition-all">
                      <td className="py-3 px-4 font-mono text-gray-550">
                        <Link href={`/cases/${c.id}`} className="hover:text-[var(--color-gold-light)]">
                          #{c.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {type}
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {c.assignee || <span className="text-gray-550 italic">Unassigned</span>}
                      </td>
                      <td className="py-3 px-4 text-gray-450">
                        {new Date(c.created_at).toLocaleDateString("en-GB")}
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {c.deadline ? new Date(c.deadline).toLocaleDateString("en-GB") : "—"}
                      </td>
                      <td className={`py-3 px-4 font-semibold ${info.style}`}>
                        {info.text === "OVERDUE" ? (
                          <span className="flex items-center gap-1">
                            <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-[9px] uppercase tracking-wider border border-red-500/35">OVERDUE</span>
                          </span>
                        ) : info.text}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase font-bold text-gray-450">
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <Link
                          href={`/cases/${c.id}`}
                          className="inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                        >
                          View Case
                        </Link>
                        
                        {c.status !== "resolved" && (
                          <>
                            <button
                              onClick={() => setReassignTarget(c)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-blue-500/20 text-blue-400 hover:bg-blue-500/10 transition-all cursor-pointer"
                            >
                              Reassign
                            </button>
                            {c.status !== "escalated" && (
                              <button
                                onClick={() => handleEscalate(c.id)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-purple-500/20 text-purple-400 hover:bg-purple-500/10 transition-all cursor-pointer"
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

      {/* Reassign Modal */}
      {reassignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-[360px] bg-[#0c0d12] border border-white/10 rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-400" />
                Reassign Case
              </h3>
              <p className="text-gray-450 text-[11px] mt-1">Assign Case #{reassignTarget.id.slice(0, 8)} to an investigator.</p>
            </div>

            <form onSubmit={handleReassignSubmit} className="space-y-4">
              <input
                type="text"
                required
                placeholder="Enter analyst name or email..."
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                className="w-full rounded-xl bg-white/[0.02] border border-white/10 px-3.5 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-gold)] text-xs h-[36px]"
              />

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setReassignTarget(null)}
                  className="flex-1 py-2 rounded-xl border border-white/10 hover:text-white text-gray-400 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[var(--color-gold)] text-[var(--color-navy)] hover:opacity-90 font-bold text-xs rounded-xl"
                >
                  Reassign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
