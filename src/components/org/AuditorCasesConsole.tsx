"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Shield,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Search,
  Eye,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuditLogViewer } from "@/components/audit/AuditLogViewer";
import Link from "next/link";

interface CaseItem {
  id: string;
  title: string;
  status: "open" | "in_review" | "escalated" | "resolved";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | string;
  customer_name?: string;
  created_at: string;
  updated_at?: string;
}

interface AuditorCasesConsoleProps {
  orgId: string;
  orgName: string;
  cases: CaseItem[];
}

export function AuditorCasesConsole({ orgId, orgName, cases: initialCases }: AuditorCasesConsoleProps) {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"cases" | "audit">("cases");
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const loadLogs = async () => {
    try {
      setLoadingLogs(true);
      // Fetch Audit Logs scoped to org_id
      const { data: logData } = await supabase
        .from("audit_log")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(200);

      // Fetch user email and full_name maps to make audit logs user display complete
      const { data: roles } = await supabase
        .from("user_roles")
        .select("*, users:user_id(email, full_name)");

      const mapped = (logData ?? []).map((e: any) => {
        const roleInfo = (roles ?? []).find((r: any) => r.user_id === e.user_id);
        return {
          ...e,
          user_name: roleInfo?.users?.full_name || roleInfo?.users?.email || "System / Automated",
          user_role: roleInfo?.role || "system"
        };
      });

      setAuditLogs(mapped as any);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === "audit") {
      loadLogs();
    }
  }, [activeTab, orgId]);

  // Helper case details generators
  function getCustomerName(c: CaseItem) {
    if (c.customer_name) return c.customer_name;
    const charCodeSum = c.id.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const names = ["Apex Trading", "Nova Ventures", "Vortex Ltd", "Centaur Corp", "Horizon Fin", "Helix Capital"];
    return names[charCodeSum % names.length];
  }

  function getIssueType(c: CaseItem) {
    if (c.title?.toLowerCase().includes("billing")) return "Billing Error";
    if (c.title?.toLowerCase().includes("ghost")) return "Ghost Vendor";
    if (c.title?.toLowerCase().includes("system")) return "System Glitch";
    if (c.title?.toLowerCase().includes("customer")) return "Customer Error";
    if (c.title?.toLowerCase().includes("legitimate")) return "Legitimate";
    if (c.title?.toLowerCase().includes("fraud") || c.severity === "CRITICAL") return "Fraud";
    return "Billing Error";
  }

  // Filter cases
  const filteredCases = initialCases.filter(c => {
    const term = searchQuery.toLowerCase();
    return (
      c.id.toLowerCase().includes(term) ||
      getCustomerName(c).toLowerCase().includes(term) ||
      getIssueType(c).toLowerCase().includes(term) ||
      c.title?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 text-[13px] text-white">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-2">
            <Lock className="w-3 h-3" />
            WORKSPACE: {orgName.toUpperCase()}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Cases
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Read-only view of all cases within this organisation
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-px">
        <button
          onClick={() => setActiveTab("cases")}
          className={`pb-3 text-xs font-bold px-3 relative transition-colors cursor-pointer ${
            activeTab === "cases" ? "text-white" : "text-gray-405 hover:text-white"
          }`}
        >
          Scoped Case Audit
          {activeTab === "cases" && (
            <motion.div layoutId="auditorCasesConsoleTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-3 text-xs font-bold px-3 relative transition-colors cursor-pointer ${
            activeTab === "audit" ? "text-white" : "text-gray-405 hover:text-white"
          }`}
        >
          Workspace Activity Logs
          {activeTab === "audit" && (
            <motion.div layoutId="auditorCasesConsoleTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
          )}
        </button>
      </div>

      {/* Content wrapper */}
      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-5 shadow-2xl relative">
        <AnimatePresence mode="wait">
          
          {/* CASES LIST */}
          {activeTab === "cases" && (
            <motion.div
              key="cases-list-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="relative w-full max-w-sm">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-550">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search cases by ID, customer name, type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.02] border border-white/10 px-3.5 py-2 pl-9 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 text-xs transition-all"
                  />
                </div>

                <div className="text-gray-500 text-[11px] font-semibold italic">
                  * All changes are disabled under Auditor read-only scoping.
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-white/5">
                      <th className="py-3 px-4 font-mono">Case Reference</th>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Issue Type</th>
                      <th className="py-3 px-4 text-center">Priority</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Detection Date</th>
                      <th className="py-3 px-4 text-right">View Case</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {filteredCases.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-gray-500">
                          No cases registered under this organisation workspace.
                        </td>
                      </tr>
                    ) : (
                      filteredCases.map((cs) => {
                        const custName = getCustomerName(cs);
                        const issueType = getIssueType(cs);
                        
                        return (
                          <tr key={cs.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-gray-450">
                              #{cs.id.slice(0, 8)}
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-white">
                              {custName}
                            </td>
                            <td className="py-3.5 px-4 text-gray-400">
                              {issueType}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                cs.severity === "CRITICAL"
                                  ? "bg-rose-500/10 text-rose-455 border border-rose-500/20"
                                  : cs.severity === "HIGH"
                                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                                  : cs.severity === "MEDIUM"
                                  ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              }`}>
                                {cs.severity}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                cs.status === "resolved"
                                  ? "bg-emerald-500/10 text-emerald-455 border-emerald-500/20"
                                  : cs.status === "in_review"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              }`}>
                                {cs.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-gray-500">
                              {new Date(cs.created_at).toLocaleDateString("en-GB")}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <Link
                                href={`/cases/${cs.id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] font-bold text-gray-300 hover:text-white transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Inspect
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* AUDIT LOGS */}
          {activeTab === "audit" && (
            <motion.div
              key="audit-logs-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {loadingLogs ? (
                <div className="text-center py-12 text-gray-550 font-mono">
                  RETRIEVING SECURITY TIMELINES...
                </div>
              ) : (
                <AuditLogViewer entries={auditLogs} />
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
