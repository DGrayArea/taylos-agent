"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updatePassword, logout, getCurrentUserRole } from "@/app/auth/actions";
import { User, Lock, Loader2, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [roleInfo, setRoleInfo] = useState<any>(null);

  // Forms state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUser(user);
      
      const meta = user.user_metadata || {};
      
      // Pull name details from user_metadata (works for password signup & Google SSO)
      let resolvedFirstName = meta.first_name || "";
      let resolvedLastName = meta.last_name || "";
      
      if (!resolvedFirstName && !resolvedLastName) {
        const fullName = meta.full_name || meta.name || "";
        if (fullName) {
          const parts = fullName.trim().split(/\s+/);
          resolvedFirstName = parts[0];
          resolvedLastName = parts.slice(1).join(" ");
        }
      }
      
      setFirstName(resolvedFirstName);
      setLastName(resolvedLastName);
      
      // Pull avatar picture (works for custom url & Google SSO)
      const resolvedAvatar = meta.avatar_url || meta.picture || "";
      setAvatarUrl(resolvedAvatar);

      try {
        const roleData = await getCurrentUserRole();
        setRoleInfo(roleData);
      } catch (err) {
        console.error("Error loading user role in profile:", err);
      }
      
      setLoading(false);
    });
  }, [router, supabase.auth]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    setPasswordLoading(true);

    try {
      const formData = new FormData();
      formData.append("password", password);

      const res = await updatePassword(formData);
      if (!res.ok) {
        setPasswordError(res.error || "Failed to update password.");
      } else {
        setPasswordSuccess("Password updated successfully!");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setPasswordError("An unexpected error occurred.");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07080d]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs text-gray-500 font-mono">LOADING PROFILE...</p>
        </div>
      </div>
    );
  }

  // Get initials for profile picture fallback
  let initials = "";
  if (firstName) {
    initials = firstName[0];
    if (lastName) initials += lastName[0];
  } else if (user?.email) {
    initials = user.email[0];
  }
  initials = initials.toUpperCase() || "U";

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-24 text-[13px] text-white">
      {/* Header */}
      <div>
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-4 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Account Settings
        </h1>
        <p className="text-gray-405 text-xs mt-1">
          Manage your personal details, workspace access, and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Side - User Summary Info */}
        <div className="space-y-4 bg-white/[0.02] border border-white/10 rounded-3xl p-5 md:p-6 text-center flex flex-col items-center">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500/30"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-2xl font-bold font-mono">
                {initials}
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              {firstName || lastName ? `${firstName} ${lastName}`.trim() : "Taylos User"}
            </h3>
            <p className="text-gray-400 text-xs font-mono">{user?.email}</p>
          </div>

          {roleInfo && (
            <div className="pt-2 w-full border-t border-white/5 space-y-2 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Workspace Role:</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {roleInfo.role?.replace("_", " ") || "Member"}
                </span>
              </div>
              {roleInfo.org_name && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Organisation:</span>
                  <span className="font-semibold text-white truncate max-w-[140px]" title={roleInfo.org_name}>
                    {roleInfo.org_name}
                  </span>
                </div>
              )}
            </div>
          )}

          <form action={logout} className="w-full pt-4 border-t border-white/5">
            <button
              type="submit"
              className="w-full py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer h-[34px]"
            >
              Sign Out
            </button>
          </form>
        </div>

        {/* Right Side - Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Form */}
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-5 md:p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                Profile Information
              </h3>
              <p className="text-gray-400 text-xs mt-1">
                Your personal details compiled from your registration account.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                    First Name
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={firstName || ""}
                    className="w-full rounded-xl bg-white/[0.01] border border-white/5 px-3.5 py-2 text-gray-400 text-xs cursor-not-allowed select-none focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Last Name
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={lastName || ""}
                    className="w-full rounded-xl bg-white/[0.01] border border-white/5 px-3.5 py-2 text-gray-400 text-xs cursor-not-allowed select-none focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Email Address
                </label>
                <input
                  type="email"
                  readOnly
                  value={user?.email || ""}
                  className="w-full rounded-xl bg-white/[0.01] border border-white/5 px-3.5 py-2 text-gray-400 text-xs cursor-not-allowed select-none focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-5 md:p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-400" />
                Update Password
              </h3>
              <p className="text-gray-400 text-xs mt-1">
                Provide a new password below to secure your credentials.
              </p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="passwordInput" className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                    New Password
                  </label>
                  <input
                    id="passwordInput"
                    type="password"
                    required
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.02] border border-white/10 px-3.5 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-xs transition-all duration-300"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="confirmPasswordInput" className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPasswordInput"
                    type="password"
                    required
                    placeholder="Min. 6 characters"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.02] border border-white/10 px-3.5 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-xs transition-all duration-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="py-2 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer h-[34px] w-full sm:w-auto"
              >
                {passwordLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Change Password
              </button>
            </form>

            {passwordSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {passwordSuccess}
              </div>
            )}
            {passwordError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {passwordError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}