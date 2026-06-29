"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { promoteToGlobalAdmin, revokeGlobalAdmin, getCurrentUserRole } from "@/app/auth/actions";
import { Shield, UserPlus, UserMinus, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface AdminItem {
  id: string;
  user_id: string;
  role: string;
  status: string;
  email?: string;
  full_name?: string;
}

export default function ManageAdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  useEffect(() => {
    // 1. Verify Global Admin Session
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { role } = await getCurrentUserRole();
      if (role !== "global_admin") {
        router.push("/");
        return;
      }

      setChecking(false);
      fetchAdmins();
    });
  }, [router, supabase.auth]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_roles")
        .select("*, users:user_id(email, full_name)")
        .eq("role", "global_admin")
        .is("org_id", null)
        .order("assigned_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const formatted = data.map((r: any) => ({
          id: r.id,
          user_id: r.user_id,
          role: r.role,
          status: r.status,
          email: r.users?.email,
          full_name: r.users?.full_name
        }));
        setAdmins(formatted);
      }
    } catch (err) {
      console.error("Error loading global admins:", err);
    } finally {
      setLoading(false);
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

      setFormSuccess(`User ${inviteEmail} has been successfully promoted to Global Admin.`);
      setInviteEmail("");
      fetchAdmins();
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

      fetchAdmins();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07080d]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs text-gray-500 font-mono">VERIFYING ADMIN STATUS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-24 text-[13px] text-white">
      {/* Header */}
      <div>
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-4 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" />
          Platform Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Manage Administrators
        </h1>
        <p className="text-gray-450 text-xs mt-1">
          Add new platform-level administrators or revoke global administration rights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Promotion Form */}
        <div className="md:col-span-2 bg-white/[0.02] border border-white/10 rounded-3xl p-5 md:p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              Promote Account
            </h3>
            <p className="text-gray-400 text-xs mt-1">
              Enter the registered email of the user to promote. They must already have created a Taylos account.
            </p>
          </div>

          <form onSubmit={handlePromoteAdmin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="adminEmailInput" className="text-[10px] font-semibold text-gray-450 uppercase tracking-wider block">
                User Email Address
              </label>
              <input
                id="adminEmailInput"
                type="email"
                required
                placeholder="e.g. name@taylos.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full rounded-xl bg-white/[0.02] border border-white/10 px-3.5 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-xs transition-all duration-300"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading === "promote"}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer h-[34px]"
            >
              {actionLoading === "promote" ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Graduate to Global Admin
            </button>
          </form>

          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-center text-xs font-semibold">
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-center text-xs font-semibold">
              {formSuccess}
            </div>
          )}
        </div>

        {/* Current Admins List */}
        <div className="space-y-4 bg-white/[0.02] border border-white/10 rounded-3xl p-5">
          <h3 className="text-sm font-bold text-white">Platform Administrators</h3>
          <p className="text-gray-400 text-[11px] leading-relaxed">
            Active administrators with platform-wide management access.
          </p>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-6 text-gray-500 font-mono text-xs animate-pulse">
                LOADING ADMINISTRATORS...
              </div>
            ) : admins.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-xs">
                No active administrators.
              </div>
            ) : (
              admins.map((admin) => (
                <div
                  key={admin.id}
                  className="p-3 rounded-2xl bg-white/[0.01] border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all duration-300"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate text-xs">{admin.full_name || "Platform Admin"}</div>
                    <div className="text-gray-500 text-[11px] truncate">{admin.email}</div>
                  </div>

                  <button
                    disabled={actionLoading === `revoke-${admin.user_id}`}
                    onClick={() => handleRevokeAdmin(admin.user_id, admin.email || "")}
                    className="p-1.5 text-gray-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Revoke Admin Access"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
