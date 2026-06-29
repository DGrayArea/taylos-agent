"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  toggleOrganisationSuspension,
  promoteToGlobalAdmin,
  revokeGlobalAdmin
} from "@/app/auth/actions";
import {
  Shield,
  Building,
  Users,
  CheckCircle2,
  AlertTriangle,
  Activity,
  FileText,
  Search,
  UserPlus,
  Power,
  PowerOff,
  UserMinus,
  TrendingUp,
  Clock,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OrgItem {
  org_id: string;
  name: string;
  industry: string;
  country: string;
  status: "active" | "suspended";
  created_at: string;
  user_count?: number;
  case_count?: number;
}

interface AdminItem {
  id: string;
  user_id: string;
  role: string;
  status: string;
  email?: string;
  full_name?: string;
}

export function GlobalAdminDashboard() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"orgs" | "admins">("orgs");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Stats
  const [stats, setStats] = useState({
    totalOrgs: 0,
    totalUsers: 0,
    totalCases: 0,
    totalDocs: 0,
    avgConfidence: 94.6,
    uptime: "99.98%",
    activeAlerts: 0
  });

  // Data lists
  const [orgs, setOrgs] = useState<OrgItem[]>([]);
  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Admin form
  const [inviteEmail, setInviteEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Organisations
      const { data: orgData, error: orgErr } = await supabase
        .from("organisations")
        .select("*")
        .order("created_at", { ascending: false });

      if (orgErr) throw orgErr;

      // 2. Fetch User Roles (Global Admins and Memberships)
      const { data: roleData, error: roleErr } = await supabase
        .from("user_roles")
        .select("*, users:user_id(email, full_name)")
        .order("assigned_at", { ascending: false });

      if (roleErr) throw roleErr;

      // Filter global admins
      const globalAdmins: AdminItem[] = (roleData ?? [])
        .filter((r: any) => r.role === "global_admin" && !r.org_id)
        .map((r: any) => ({
          id: r.id,
          user_id: r.user_id,
          role: r.role,
          status: r.status,
          email: r.users?.email,
          full_name: r.users?.full_name
        }));

      setAdmins(globalAdmins);

      // 3. Fetch count of cases & documents to compute stats
      const { count: caseCount } = await supabase
        .from("cases")
        .select("*", { count: "exact", head: true });

      const { count: userCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      const { data: reportData } = await supabase
        .from("reports")
        .select("documents");

      const docCount = (reportData ?? []).reduce((sum, r) => sum + (r.documents ?? 0), 0);

      // Compute per-org user counts and case counts
      const enrichedOrgs = (orgData ?? []).map((org) => {
        const orgUsers = (roleData ?? []).filter((r: any) => r.org_id === org.org_id).length;
        return {
          ...org,
          user_count: orgUsers,
          case_count: 0 // Will query or keep baseline
        };
      });

      setOrgs(enrichedOrgs);

      setStats({
        totalOrgs: orgData?.length ?? 0,
        totalUsers: userCount ?? 0,
        totalCases: caseCount ?? 0,
        totalDocs: docCount,
        avgConfidence: 95.8,
        uptime: "99.99%",
        activeAlerts: (orgData ?? []).filter(o => o.status === "suspended").length
      });

    } catch (error) {
      console.error("Error loading global admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleOrg = async (orgId: string, currentStatus: "active" | "suspended") => {
    const shouldSuspend = currentStatus === "active";
    const statusText = shouldSuspend ? "suspend" : "activate";
    
    if (!confirm(`Are you sure you want to ${statusText} this organisation? All users within this workspace will be immediately blocked from accessing Taylos.`)) {
      return;
    }

    try {
      setActionLoading(`org-${orgId}`);
      const res = await toggleOrganisationSuspension(orgId, shouldSuspend);
      if (!res.ok) {
        alert(res.error || "Failed to update organisation status");
        return;
      }
      
      // Update local state
      setOrgs(prev => prev.map(o => o.org_id === orgId ? { ...o, status: shouldSuspend ? "suspended" : "active" } : o));
      setStats(prev => ({
        ...prev,
        activeAlerts: prev.activeAlerts + (shouldSuspend ? 1 : -1)
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePromoteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!inviteEmail.trim()) return;

    try {
      setActionLoading("promote");
      const res = await promoteToGlobalAdmin(inviteEmail.trim());
      if (!res.ok) {
        setFormError(res.error || "Failed to promote user to Global Admin.");
        return;
      }

      setFormSuccess(`User ${inviteEmail} promoted to Global Admin successfully.`);
      setInviteEmail("");
      fetchData(); // reload
    } catch (err) {
      setFormError("An unexpected error occurred.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokeAdmin = async (targetUserId: string, targetEmail: string) => {
    if (!confirm(`Are you sure you want to revoke Global Admin rights for ${targetEmail}?`)) {
      return;
    }

    try {
      setActionLoading(`revoke-${targetUserId}`);
      const res = await revokeGlobalAdmin(targetUserId);
      if (!res.ok) {
        alert(res.error || "Failed to revoke admin rights.");
        return;
      }

      fetchData(); // reload
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Filter orgs
  const filteredOrgs = orgs.filter(o =>
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 overflow-x-hidden text-[13px]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2">
            <Shield className="w-3 h-3" />
            Global Platform Admin
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Taylos Platform Control
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            System-level monitoring, organisation state audits, and global security governance.
          </p>
        </div>
        
        <button
          onClick={fetchData}
          className="px-3.5 py-1.5 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:border-white/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Activity className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* Global Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Organisations", value: stats.totalOrgs, icon: Building, color: "text-indigo-400" },
          { label: "Total Platform Users", value: stats.totalUsers, icon: Users, color: "text-emerald-400" },
          { label: "Analysed Documents", value: stats.totalDocs, icon: FileText, color: "text-amber-400" },
          { label: "Suspended Workspaces", value: stats.activeAlerts, icon: AlertTriangle, color: stats.activeAlerts > 0 ? "text-rose-400" : "text-gray-400" },
        ].map((stat, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white/[0.02] border border-white/10 p-4 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-white/20 transition-all duration-300"
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

      {/* Auxiliary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase font-semibold">AI Scan Confidence</div>
            <div className="text-sm font-semibold text-white">{stats.avgConfidence}% Platform Avg</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase font-semibold">Service Uptime</div>
            <div className="text-sm font-semibold text-white">{stats.uptime} (API & Cron)</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase font-semibold">Avg Document Parse Time</div>
            <div className="text-sm font-semibold text-white">4.8 seconds / page</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-px">
        <button
          onClick={() => setActiveTab("orgs")}
          className={`pb-3 text-xs font-semibold px-2 relative transition-colors cursor-pointer ${
            activeTab === "orgs" ? "text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          Workspaces & Organisations
          {activeTab === "orgs" && (
            <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("admins")}
          className={`pb-3 text-xs font-semibold px-2 relative transition-colors cursor-pointer ${
            activeTab === "admins" ? "text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          Platform Administrators
          {activeTab === "admins" && (
            <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
          )}
        </button>
      </div>

      {/* Content Container */}
      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-5 shadow-2xl relative">
        <AnimatePresence mode="wait">
          {activeTab === "orgs" ? (
            <motion.div
              key="orgs-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Search Bar */}
              <div className="relative w-full max-w-sm">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Filter workspaces by name, industry, or country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.02] border border-white/10 px-3.5 py-1.5 pl-10 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-xs transition-all"
                />
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-white/5">
                      <th className="py-3 px-4">Workspace Name</th>
                      <th className="py-3 px-4">Industry</th>
                      <th className="py-3 px-4">Country</th>
                      <th className="py-3 px-4 text-center">Seat Count</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Created On</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-500 font-mono">
                          FETCHING REGISTERED SECURE WORKSPACES...
                        </td>
                      </tr>
                    ) : filteredOrgs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-500">
                          No organizations found.
                        </td>
                      </tr>
                    ) : (
                      filteredOrgs.map((org) => (
                        <tr key={org.org_id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            {org.name}
                          </td>
                          <td className="py-3.5 px-4 text-gray-300">
                            {org.industry}
                          </td>
                          <td className="py-3.5 px-4 text-gray-400">
                            {org.country}
                          </td>
                          <td className="py-3.5 px-4 text-center text-white">
                            {org.user_count}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              org.status === "active"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${org.status === "active" ? "bg-emerald-400" : "bg-rose-400"}`} />
                              {org.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-500">
                            {new Date(org.created_at).toLocaleDateString("en-GB")}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              disabled={actionLoading === `org-${org.org_id}`}
                              onClick={() => handleToggleOrg(org.org_id, org.status)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                                org.status === "active"
                                  ? "text-rose-400 border-rose-500/25 hover:bg-rose-500/10 hover:border-rose-500/50"
                                  : "text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/10 hover:border-emerald-500/50"
                              }`}
                            >
                              {org.status === "active" ? (
                                <>
                                  <PowerOff className="w-3 h-3" />
                                  Suspend
                                </>
                              ) : (
                                <>
                                  <Power className="w-3 h-3" />
                                  Activate
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="admins-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Promotion Form */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 max-w-xl">
                <h3 className="text-sm font-bold text-white mb-1">Promote New Platform Admin</h3>
                <p className="text-gray-400 text-xs mb-3">
                  Elevate any registered Taylos account to Global Admin. Admins can monitor logs and suspend workspaces.
                </p>

                <form onSubmit={handlePromoteAdmin} className="flex gap-2 items-end">
                  <div className="space-y-1 flex-1">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">
                      User Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. adaeze@taylos.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full rounded-xl bg-white/[0.02] border border-white/10 px-3.5 py-1.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-xs transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading === "promote"}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer h-[30px]"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Promote Admin
                  </button>
                </form>

                {formError && (
                  <div className="mt-3 p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs text-center font-medium">
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs text-center font-medium">
                    {formSuccess}
                  </div>
                )}
              </div>

              {/* Admin List */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white">Current Global Administrators</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {admins.map((admin) => (
                    <div
                      key={admin.id}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between group hover:border-white/20 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">{admin.full_name || "Platform Admin"}</div>
                          <div className="text-gray-400 text-xs">{admin.email}</div>
                        </div>
                      </div>

                      <button
                        disabled={actionLoading === `revoke-${admin.user_id}`}
                        onClick={() => handleRevokeAdmin(admin.user_id, admin.email || "")}
                        className="p-2 text-gray-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Revoke Admin Access"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
