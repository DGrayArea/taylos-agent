import { createClient } from "@supabase/supabase-js";
import { acceptInvitation } from "../actions";
import { Building, Shield, User, Lock, Eye, ArrowRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

// Initialize admin client to query invitations securely
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AcceptInviteProps {
  searchParams: Promise<{ token?: string; error?: string }>;
}

export default async function AcceptInvitePage({ searchParams }: AcceptInviteProps) {
  const params = await searchParams;
  const token = params.token;
  const errorMsg = params.error;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07080d] px-4">
        <div className="w-full max-w-[380px] bg-white/[0.02] border border-rose-500/20 rounded-3xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-white">Missing Token</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            This invitation link is incomplete. Please check your email and try again.
          </p>
          <Link
            href="/auth/login"
            className="block w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white hover:bg-white/10 transition-all"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Fetch invitation and associated org details
  const { data: invite, error } = await supabaseAdmin
    .from("org_invitations")
    .select("*, organisations(name)")
    .eq("token", token)
    .eq("status", "pending")
    .limit(1)
    .maybeSingle();

  const orgObj = invite?.organisations as unknown as { name: string } | null;

  if (error || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07080d] px-4">
        <div className="w-full max-w-[380px] bg-white/[0.02] border border-rose-500/20 rounded-3xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-white">Invalid Invitation</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            This invitation token is invalid, already accepted, or has been revoked.
          </p>
          <Link
            href="/auth/login"
            className="block w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white hover:bg-white/10 transition-all"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Check expiration (48 hours expiry check)
  const isExpired = new Date(invite.expires_at) < new Date();
  if (isExpired) {
    // Auto-update to expired
    await supabaseAdmin
      .from("org_invitations")
      .update({ status: "expired" })
      .eq("invitation_id", invite.invitation_id);

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07080d] px-4">
        <div className="w-full max-w-[380px] bg-white/[0.02] border border-rose-500/20 rounded-3xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-white">Expired Invitation</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            This invitation expired after 48 hours. Please contact your organization administrator to receive a new link.
          </p>
          <Link
            href="/auth/login"
            className="block w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white hover:bg-white/10 transition-all"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07080d] px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 bg-grid-white/[0.01] bg-[size:30px_30px]" />
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[var(--color-accent)]/10 blur-[130px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[var(--color-gold)]/5 blur-[130px] pointer-events-none animate-pulse" />

      <div className="w-full max-w-[380px] relative z-10 bg-white/[0.02] backdrop-blur-2xl border border-white/10 hover:border-indigo-500/30 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 md:p-8 transition-all duration-500">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-500 flex items-center justify-center shadow-[0_8px_24px_rgba(16,185,129,0.25)] mb-3">
            <Building className="w-6 h-6 text-white" />
          </div>
          
          <h2 className="text-xl font-bold text-white tracking-tight">
            Accept Invitation
          </h2>
          <p className="text-gray-400 text-xs mt-2 leading-relaxed">
            You have been invited to join <span className="text-white font-bold">{orgObj?.name}</span> on Taylos Agent.
          </p>
          
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            Joining as: {invite.role}
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form className="space-y-4" action={acceptInvitation}>
          <input type="hidden" name="token" value={token} />

          {/* Email (Read only) */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">
              Invited Email
            </label>
            <input
              type="text"
              disabled
              value={invite.invited_email}
              className="w-full rounded-xl bg-white/5 border border-white/5 px-3.5 py-2.5 text-gray-400 text-xs focus:outline-none cursor-not-allowed"
            />
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="text-[10px] font-semibold text-gray-450 uppercase tracking-wider block">
              Your Full Name
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                <User className="w-4 h-4" />
              </span>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="w-full rounded-xl bg-white/[0.02] border border-white/10 px-3.5 py-2.5 pl-10.5 text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] text-xs transition-all"
                placeholder="Adaeze Okonkwo"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-[10px] font-semibold text-gray-450 uppercase tracking-wider block">
              Create Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded-xl bg-white/[0.02] border border-white/10 px-3.5 py-2.5 pl-10.5 text-white placeholder-gray-600 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] text-xs transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-[0_4px_16px_rgba(16,185,129,0.25)] focus:outline-none transition-all cursor-pointer"
          >
            Join Organisation
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-gray-400">
          Already verified?{" "}
          <Link href="/auth/login" className="text-[var(--color-gold-light)] hover:text-white font-semibold transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
