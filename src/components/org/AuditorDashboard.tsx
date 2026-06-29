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
  TrendingUp,
  Download,
  Activity,
  ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuditLogViewer } from "@/components/audit/AuditLogViewer";
import Link from "next/link";

interface AuditorDashboardProps {
  orgId: string;
  orgName: string;
}

interface CaseItem {
  case_id: string;
  type: string;
  status: "open" | "in_review" | "resolved";
  priority: "critical" | "high" | "medium" | "low";
  customer_name: string;
  created_at: string;
  anomaly_details?: any;
}

export function AuditorDashboard({ orgId, orgName }: AuditorDashboardProps) {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"cases" | "audit">("cases");
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [stats, setStats] = useState({
    totalCases: 0,
    resolvedCases: 0,
    openCases: 0,
    complianceScore: 97.4
  });

  const loadComplianceData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Cases scoped to org_id
      const { data: casesData } = await supabase
        .from("cases")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });

      if (casesData) {
        setCases(casesData);
        const resolved = casesData.filter(c => c.status === "resolved").length;
        const total = casesData.length;
        const score = total > 0 ? Math.round((resolved / total) * 100) : 100;
        setStats({
          totalCases: total,
          resolvedCases: resolved,
          openCases: total - resolved,
          complianceScore: score
        });
      }

      // 2. Fetch Audit Logs scoped to org_id
      const { data: logData } = await supabase
        .from("audit_log")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (logData) {
        setAuditLogs(logData as any);
      }

    } catch (err) {
      console.error("Error loading auditor compliance dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplianceData();
  }, [orgId]);

  // Filter cases
  const filteredCases = cases.filter(c =>
    c.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.case_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 text-[13px]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-2">
            <Lock className="w-3 h-3" />
            Compliance Auditor Overview
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Compliance Operations Console
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Read-only workspace surveillance, security timelines, and regulatory assurance auditing.
          </p>
        </div>

        <button
          onClick={loadComplianceData}
          className="px-3.5 py-1.5 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:border-white/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Activity className="w-3.5 h-3.5" />
          Refresh Audit Metrics
        </button>
      </div>

      {/* Compliance Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Compliance Score", value: `${stats.complianceScore}%`, icon: TrendingUp, color: "text-emerald-400" },
          { label: "Total Tracked Cases", value: stats.totalCases, icon: FileText, color: "text-indigo-400" },
          { label: "Resolved Cases", value: stats.resolvedCases, icon: CheckCircle2, color: "text-emerald-400" },
          { label: "Open Investigations", value: stats.openCases, icon: AlertTriangle, color: stats.openCases > 0 ? "text-amber-400" : "text-gray-400" },
        ].map((stat, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white/[0.02] border border-white/10 p-4 flex items-center justify-between shadow-lg"
          >
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">
                {stat.label}
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {loading ? "..." : stat.value}
              </div>
            </div>
            <div className={`p-3 rounded-xl bg-white/[0.02] ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-px">
        <button
          onClick={() => setActiveTab("cases")}
          className={`pb-3 text-xs font-semibold px-2 relative transition-colors cursor-pointer ${
            activeTab === "cases" ? "text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          Scoped Case Audit
          {activeTab === "cases" && (
            <motion.div layoutId="auditorTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-3 text-xs font-semibold px-2 relative transition-colors cursor-pointer ${
            activeTab === "audit" ? "text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          Workspace Activity Logs
          {activeTab === "audit" && (
            <motion.div layoutId="auditorTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-5 shadow-2xl relative">
        <AnimatePresence mode="wait">
          
          {/* CASES LIST */}
          {activeTab === "cases" && (
            <motion.div
              key="cases-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="relative w-full max-w-sm">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search cases by ID, customer name, type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.02] border border-white/10 px-3.5 py-1.5 pl-10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 text-xs transition-all"
                  />
                </div>

                <div className="text-gray-500 text-[11px] font-medium italic">
                  * All changes disabled under Auditor read-only scoping.
                </div>
              </div>

              {/* Cases Table */}
              <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-white/5">
                      <th className="py-3 px-4">Case Reference</th>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Issue Type</th>
                      <th className="py-3 px-4 text-center">Priority</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Detection Date</th>
                      <th className="py-3 px-4 text-right">View Case</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-500 font-mono">
                          LOADING SECURITY DISPUTES...
                        </td>
                      </tr>
                    ) : filteredCases.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-500">
                          No cases registered under this organisation workspace.
                        </td>
                      </tr>
                    ) : (
                      filteredCases.map((cs) => (
                        <tr key={cs.case_id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-white">
                            #{cs.case_id}
                          </td>
                          <td className="py-3.5 px-4 text-gray-300 font-semibold">
                            {cs.customer_name}
                          </td>
                          <td className="py-3.5 px-4 text-gray-450">
                            {cs.type}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              cs.priority === "critical"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : cs.priority === "high"
                                ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                                : cs.priority === "medium"
                                ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }`}>
                              {cs.priority}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              cs.status === "resolved"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : cs.status === "in_review"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            }`}>
                              {cs.status.toUpperCase().replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-500">
                            {new Date(cs.created_at).toLocaleString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Link
                              href={`/cases/${cs.case_id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] font-bold text-gray-300 hover:text-white transition-all"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Inspect
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* AUDIT LOGS */}
          {activeTab === "audit" && (
            <motion.div
              key="audit-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AuditLogViewer entries={auditLogs} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
