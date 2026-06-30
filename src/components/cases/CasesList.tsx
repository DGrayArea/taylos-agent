"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle, CheckCircle, Clock, User, Plus, Filter,
  ChevronRight, Calendar, Tag, Shield, Search
} from "lucide-react";
import { ComprehensiveAnalysis } from "@/lib/types";

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

interface Props {
  initialCases: CaseRow[];
  reports: any[];
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
  LOW: "text-green-400 bg-green-500/10 border-green-500/20",
};

function getCaseType(c: CaseRow) {
  if (c.title?.toLowerCase().includes("billing")) return "Billing Error";
  if (c.title?.toLowerCase().includes("ghost")) return "Ghost Vendor";
  if (c.title?.toLowerCase().includes("system")) return "System Glitch";
  if (c.title?.toLowerCase().includes("customer")) return "Customer Error";
  if (c.title?.toLowerCase().includes("legitimate")) return "Legitimate";
  if (c.title?.toLowerCase().includes("fraud") || c.severity === "CRITICAL") return "Fraud";
  
  const types = ["Billing Error", "Fraud", "Ghost Vendor", "System Glitch", "Customer Error", "Legitimate"];
  const charCodeSum = c.id.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  return types[charCodeSum % types.length];
}

function getCustomerRef(c: CaseRow) {
  const charCodeSum = c.id.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  return `ACC-${100000 + (charCodeSum % 900000)}`;
}

export function CasesList({ initialCases }: Props) {
  const [cases, setCases] = useState<CaseRow[]>(initialCases);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = cases.filter((c) => {
    // Status filter
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    
    // Search filter
    if (searchTerm.trim() !== "") {
      const s = searchTerm.toLowerCase();
      const caseType = getCaseType(c).toLowerCase();
      const custRef = getCustomerRef(c).toLowerCase();
      const title = c.title?.toLowerCase() || "";
      const desc = c.description?.toLowerCase() || "";
      const id = c.id.toLowerCase();
      
      if (!title.includes(s) && !desc.includes(s) && !caseType.includes(s) && !custRef.includes(s) && !id.includes(s)) {
        return false;
      }
    }
    return true;
  });

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

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 text-white text-[13px]">
      {/* Top Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Cases</h1>
        <p className="text-gray-400 text-sm">
          View and action all cases assigned within your organisation
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b border-white/5 pb-4">
        {/* Filter options */}
        <div className="flex gap-1.5 overflow-x-auto whitespace-nowrap pb-1 md:pb-0">
          {["all", "open", "in_review", "escalated", "resolved"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer capitalize ${
                statusFilter === s
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-transparent border-transparent text-gray-405 hover:text-white hover:bg-white/5"
              }`}
            >
              {s === "all" ? "All" : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label || s}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-550" />
          <input
            type="text"
            placeholder="Search cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-gold)]/50"
          />
        </div>
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
                <th className="py-3.5 px-4 text-center">Priority</th>
                <th className="py-3.5 px-4">Deadline</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-500">
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
    </div>
  );
}
