"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { Loader2, RefreshCw, Building } from "lucide-react";

interface OrgAdminDashboardProps {
  orgId: string;
  orgName: string;
}

export function OrgAdminDashboard({ orgId, orgName }: OrgAdminDashboardProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  // States for stats
  const [reports, setReports] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [activeMembersCount, setActiveMembersCount] = useState(0);
  const [suspendedMembersCount, setSuspendedMembersCount] = useState(0);
  const [openDeadlinesCount, setOpenDeadlinesCount] = useState(0);
  const [caseActivityData, setCaseActivityData] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Fetch organization reports
      const { data: reportsData } = await supabase
        .from("reports")
        .select("id, created_at, issues, documents, status, data")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });

      // 2. Fetch organization cases
      const { data: casesData } = await supabase
        .from("cases")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });

      // 3. Fetch organization members
      const { data: memberData } = await supabase
        .from("user_roles")
        .select("status")
        .eq("org_id", orgId);

      const caseList = casesData || [];
      const reportList = reportsData || [];
      const memberList = memberData || [];

      // Calculate aggregates
      setReports(reportList);
      setCases(caseList);

      // Active vs Suspended members
      const active = memberList.filter(m => m.status === "active").length;
      const suspended = memberList.filter(m => m.status === "suspended").length;
      setActiveMembersCount(active);
      setSuspendedMembersCount(suspended);

      // Open deadlines count (cases not resolved, having a deadline)
      const openDeadlines = caseList.filter(c => c.status !== "resolved" && c.deadline).length;
      setOpenDeadlinesCount(openDeadlines);

      // Compute Case Activity (opened vs resolved over the last 30 days)
      const activity = [];
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

        // Count cases opened on this date
        const opened = caseList.filter(c => {
          const openedDate = new Date(c.created_at);
          return openedDate.toDateString() === d.toDateString();
        }).length;

        // Count cases resolved on this date
        const resolved = caseList.filter(c => {
          if (c.status !== "resolved" || !c.updated_at) return false;
          const resolvedDate = new Date(c.updated_at);
          return resolvedDate.toDateString() === d.toDateString();
        }).length;

        activity.push({ date: dateStr, Opened: opened, Resolved: resolved });
      }
      setCaseActivityData(activity);

    } catch (err) {
      console.error("Error loading organisation dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs text-gray-500 font-mono">LOADING ORGANISATIONAL INTELLIGENCE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 text-[13px] text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-[var(--color-gold-light)] uppercase tracking-wider mb-2">
            <Building className="w-3 h-3" />
            WORKSPACE: {orgName.toUpperCase()}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Workspace Console
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Review organization analytics, anomaly metrics, and case resolutions for {orgName}.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-3.5 py-1.5 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:border-white/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer bg-white/5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reload Data
        </button>
      </div>

      <AnalyticsDashboard
        reports={reports}
        cases={cases}
        activeMembersCount={activeMembersCount}
        suspendedMembersCount={suspendedMembersCount}
        openDeadlinesCount={openDeadlinesCount}
        caseActivityData={caseActivityData}
      />
    </div>
  );
}
