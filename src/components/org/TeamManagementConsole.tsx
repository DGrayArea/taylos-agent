"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  inviteTeamMember,
  promoteTeamMember,
  suspendTeamMember,
  unsuspendTeamMember,
  revokeTeamMember
} from "@/app/auth/actions";
import {
  Users,
  Building,
  Plus,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  MoreVertical,
  Trash2,
  Shield,
  UserCheck,
  UserMinus,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TeamManagementConsoleProps {
  orgId: string;
  orgName: string;
}

interface MemberItem {
  id: string;
  user_id: string;
  role: "org_admin" | "analyst" | "auditor";
  status: "active" | "suspended";
  assigned_at: string;
  email?: string;
  full_name?: string;
  last_active?: string;
}

interface InviteItem {
  invitation_id: string;
  invited_email: string;
  role: "org_admin" | "analyst" | "auditor";
  token: string;
  expires_at: string;
  status: "pending" | "accepted" | "expired";
  created_at: string;
}

function formatRelativeTime(dateStr?: string) {
  if (!dateStr) return "2 hours ago";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function TeamManagementConsole({ orgId, orgName }: TeamManagementConsoleProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // States
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [invites, setInvites] = useState<InviteItem[]>([]);
  
  // Invite Form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"analyst" | "auditor">("analyst");
  const [generatedInviteLink, setGeneratedInviteLink] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Promote Modal state
  const [promoteTarget, setPromoteTarget] = useState<MemberItem | null>(null);

  // Dropdown states per row
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Organization Members (user_roles with public.users info)
      const { data: memberData } = await supabase
        .from("user_roles")
        .select("*, users:user_id(email, full_name, last_active)")
        .eq("org_id", orgId)
        .order("assigned_at", { ascending: false });

      if (memberData) {
        const formattedMembers = memberData.map((m: any) => ({
          id: m.id,
          user_id: m.user_id,
          role: m.role,
          status: m.status,
          assigned_at: m.assigned_at,
          email: m.users?.email,
          full_name: m.users?.full_name,
          last_active: m.users?.last_active
        }));
        setMembers(formattedMembers);
      }

      // 2. Fetch Pending Invitations
      const { data: inviteData } = await supabase
        .from("org_invitations")
        .select("*")
        .eq("org_id", orgId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (inviteData) {
        setInvites(inviteData);
      }
    } catch (err) {
      console.error("Error loading team console data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  // Member Action Triggers
  const handlePromoteConfirm = async (newRole: "org_admin" | "analyst" | "auditor") => {
    if (!promoteTarget) return;

    try {
      setActionLoading(`role-${promoteTarget.user_id}`);
      const res = await promoteTeamMember(orgId, promoteTarget.user_id, newRole);
      if (!res.ok) alert(res.error || "Failed to update role");
      setPromoteTarget(null);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleSuspend = async (userId: string, currentStatus: string) => {
    const isSuspended = currentStatus === "suspended";
    if (!confirm(`Are you sure you want to ${isSuspended ? "reinstate" : "suspend"} this user?`)) return;

    try {
      setActionLoading(`status-${userId}`);
      const res = isSuspended 
        ? await unsuspendTeamMember(orgId, userId)
        : await suspendTeamMember(orgId, userId);

      if (!res.ok) alert(res.error || "Failed to toggle suspension");
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
      setActiveDropdown(null);
    }
  };

  const handleRevoke = async (userId: string) => {
    if (!confirm("Are you sure you want to revoke this user's membership? They will be removed from your organization immediately.")) return;

    try {
      setActionLoading(`revoke-${userId}`);
      const res = await revokeTeamMember(orgId, userId);
      if (!res.ok) alert(res.error || "Failed to revoke membership");
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
      setActiveDropdown(null);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratedInviteLink("");
    
    if (!inviteEmail.trim()) return;

    try {
      setActionLoading("invite");
      const res = await inviteTeamMember(orgId, inviteEmail.trim(), inviteRole);
      if (!res.ok) {
        alert(res.error || "Failed to generate invitation.");
        return;
      }

      if (res.inviteLink) {
        const absoluteUrl = `${window.location.protocol}//${window.location.host}${res.inviteLink}`;
        setGeneratedInviteLink(absoluteUrl);
      }
      setInviteEmail("");
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokeInvite = async (invitationId: string) => {
    if (!confirm("Are you sure you want to revoke this invitation?")) return;

    try {
      setActionLoading(`invite-revoke-${invitationId}`);
      const { error } = await supabase
        .from("org_invitations")
        .delete()
        .eq("invitation_id", invitationId);

      if (error) {
        alert(error.message);
      } else {
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 text-[13px] text-white">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-[var(--color-gold-light)] uppercase tracking-wider mb-2">
            <Building className="w-3 h-3" />
            WORKSPACE: {orgName.toUpperCase()}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-400" />
            Team & Members
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Manage your organization's team structure, roles, and active invitations.
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

      {/* Invite User Card */}
      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-5 md:p-6 shadow-2xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Invite User</h3>
        <form onSubmit={handleInviteSubmit} className="flex flex-col md:flex-row gap-3 items-end">
          <div className="space-y-1.5 flex-1 w-full">
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">
              Enter email address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. name@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full rounded-xl bg-white/[0.02] border border-white/10 px-3.5 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-gold)] text-xs transition-all h-[36px]"
            />
          </div>

          <div className="space-y-1.5 w-full md:w-56">
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">
              Assigned Team Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="w-full rounded-xl bg-black border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[var(--color-gold)] text-xs transition-all h-[36px]"
            >
              <option value="analyst">Analyst</option>
              <option value="auditor">Auditor</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={actionLoading === "invite"}
            className="w-full md:w-auto px-5 py-2 bg-[var(--color-gold)] text-[var(--color-navy)] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer h-[36px] hover:opacity-90 uppercase tracking-wider"
          >
            {actionLoading === "invite" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Invite User"}
          </button>
        </form>

        {generatedInviteLink && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl space-y-2 mt-4">
            <div className="text-[10px] font-semibold text-[var(--color-gold-light)] uppercase flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Local Invite Generated
            </div>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Copy the onboarding token URL below to complete the registration flow:
            </p>
            <div className="flex items-center justify-between gap-2 bg-black border border-white/5 rounded-xl p-2 font-mono text-[10px] text-white">
              <span className="truncate flex-1 select-all">{generatedInviteLink}</span>
              <button
                onClick={() => copyToClipboard(generatedInviteLink)}
                className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Pending Invitations */}
        {invites.length > 0 && (
          <div className="pt-4 border-t border-white/5 space-y-2">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Invitations</div>
            <div className="overflow-x-auto rounded-xl border border-white/5">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.01] text-[9px] text-gray-500 font-bold uppercase tracking-wider border-b border-white/5">
                    <th className="py-2.5 px-4">Email</th>
                    <th className="py-2.5 px-4">Role</th>
                    <th className="py-2.5 px-4">Invited</th>
                    <th className="py-2.5 px-4">Expires</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invites.map((invite) => (
                    <tr key={invite.invitation_id} className="hover:bg-white/[0.01]">
                      <td className="py-2 px-4 text-white font-medium">{invite.invited_email}</td>
                      <td className="py-2 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-semibold border ${
                          invite.role === "analyst" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        }`}>
                          {invite.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-gray-450">{new Date(invite.created_at).toLocaleDateString("en-GB")}</td>
                      <td className="py-2 px-4 text-gray-450">{new Date(invite.expires_at).toLocaleDateString("en-GB")}</td>
                      <td className="py-2 px-4 text-right">
                        <button
                          disabled={actionLoading === `invite-revoke-${invite.invitation_id}`}
                          onClick={() => handleRevokeInvite(invite.invitation_id)}
                          className="text-rose-400 hover:text-rose-300 font-semibold transition-all px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-[10px]"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Main Team Table Card */}
      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-5 md:p-6 shadow-2xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Team Members</h3>
        
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-white/5">
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500 font-mono animate-pulse">
                    FETCHING ACTIVE TEAM...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    No active team members.
                  </td>
                </tr>
              ) : (
                members.map((member) => {
                  const isSuspended = member.status === "suspended";
                  const avatarLetter = (member.full_name || member.email || "U")[0].toUpperCase();
                  
                  return (
                    <tr
                      key={member.id}
                      className={`hover:bg-white/[0.01] transition-all ${
                        isSuspended ? "bg-rose-950/10 border-l-2 border-l-rose-500/40 text-gray-400" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            isSuspended 
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                              : member.role === "org_admin"
                                ? "bg-amber-500/20 text-[var(--color-gold-light)] border border-amber-500/30"
                                : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          }`}>
                            {avatarLetter}
                          </div>
                          <span className={`font-semibold ${isSuspended ? "text-gray-450" : "text-white"}`}>
                            {member.full_name || "Name Pending"}
                          </span>
                        </div>
                      </td>
                      <td className={`py-3 px-4 ${isSuspended ? "text-gray-500" : "text-gray-300"}`}>
                        {member.email}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          member.role === "org_admin"
                            ? "bg-amber-500/10 text-[var(--color-gold-light)] border-amber-500/20"
                            : member.role === "analyst"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        }`}>
                          {member.role === "org_admin" ? "ORG ADMIN" : member.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          isSuspended
                            ? "bg-rose-500/10 text-rose-450 border border-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20"
                        }`}>
                          {member.status.toUpperCase()}
                        </span>
                      </td>
                      <td className={`py-3 px-4 font-mono text-[11px] ${isSuspended ? "text-gray-500" : "text-gray-400"}`}>
                        {formatRelativeTime(member.last_active)}
                      </td>
                      <td className="py-3 px-4 text-right relative">
                        {member.role !== "org_admin" && (
                          <div className="inline-block text-left">
                            <button
                              onClick={() => setActiveDropdown(activeDropdown === member.id ? null : member.id)}
                              className="p-1 text-gray-450 hover:text-white hover:bg-white/5 rounded transition-all cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            
                            {activeDropdown === member.id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-10" 
                                  onClick={() => setActiveDropdown(null)} 
                                />
                                <div className="absolute right-0 mt-1 w-32 rounded-xl bg-[#111218] border border-white/10 shadow-2xl z-20 overflow-hidden py-1">
                                  {!isSuspended ? (
                                    <>
                                      <button
                                        onClick={() => {
                                          setPromoteTarget(member);
                                          setActiveDropdown(null);
                                        }}
                                        className="w-full px-3 py-2 text-left text-[11px] text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
                                      >
                                        <Shield className="w-3.5 h-3.5 text-blue-400" />
                                        Promote
                                      </button>
                                      <button
                                        onClick={() => handleToggleSuspend(member.user_id, member.status)}
                                        className="w-full px-3 py-2 text-left text-[11px] text-rose-400 hover:bg-rose-500/10 transition-all flex items-center gap-1.5"
                                      >
                                        <UserMinus className="w-3.5 h-3.5" />
                                        Suspend
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => handleToggleSuspend(member.user_id, member.status)}
                                      className="w-full px-3 py-2 text-left text-[11px] text-emerald-400 hover:bg-emerald-500/10 transition-all flex items-center gap-1.5"
                                    >
                                      <UserCheck className="w-3.5 h-3.5" />
                                      Reinstate
                                    </button>
                                  )}
                                  
                                  <button
                                    onClick={() => handleRevoke(member.user_id)}
                                    className="w-full px-3 py-2 text-left text-[11px] text-gray-400 hover:text-white hover:bg-white/5 border-t border-white/5 transition-all flex items-center gap-1.5"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Revoke
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
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

      {/* Promote Options Modal */}
      {promoteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[360px] bg-[#0c0d12] border border-white/10 rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] p-6 space-y-5 relative"
          >
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                Promote Role
              </h3>
              <p className="text-gray-400 text-[11px] mt-1">
                Select a higher platform role for <strong>{promoteTarget.full_name || promoteTarget.email}</strong>.
              </p>
            </div>

            <div className="space-y-2.5">
              {promoteTarget.role === "auditor" ? (
                <button
                  onClick={() => handlePromoteConfirm("analyst")}
                  className="w-full p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group"
                >
                  <div className="font-semibold text-white group-hover:text-[var(--color-gold-light)]">Auditor → Analyst</div>
                  <div className="text-gray-500 text-[10px] mt-0.5">Allows case management & review operations.</div>
                </button>
              ) : promoteTarget.role === "analyst" ? (
                <button
                  onClick={() => handlePromoteConfirm("org_admin")}
                  className="w-full p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group"
                >
                  <div className="font-semibold text-white group-hover:text-[var(--color-gold-light)]">Analyst → Organisation Admin</div>
                  <div className="text-gray-500 text-[10px] mt-0.5">Full credentials, settings, and member management.</div>
                </button>
              ) : (
                <div className="text-gray-500 text-xs py-4 text-center">No further promotion paths available.</div>
              )}
            </div>

            <button
              onClick={() => setPromoteTarget(null)}
              className="w-full text-center text-xs text-gray-500 hover:text-white font-medium transition-colors cursor-pointer pt-2"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}

    </div>
  );
}
