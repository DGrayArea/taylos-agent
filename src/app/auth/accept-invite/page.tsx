import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { acceptInvitation, acceptInvitationForExistingUser, logout } from "../actions";
import { Building, Shield, User, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AcceptInviteClient } from "./AcceptInviteClient";

// Initialize admin client to query invitations and users securely
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
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto text-lg">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-white">Missing Token</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            This invitation link is incomplete. Please check your email and try again.
          </p>
          <Link
            href="/auth/login"
            className="block w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white hover:bg-white/10 transition-all text-center"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // 1. Fetch invitation and associated org details
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
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto text-lg">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-white">Invalid Invitation</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            This invitation token is invalid, already accepted, or has been revoked.
          </p>
          <Link
            href="/auth/login"
            className="block w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white hover:bg-white/10 transition-all text-center"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // 2. Check expiration (48 hours expiry check)
  const isExpired = new Date(invite.expires_at) < new Date();
  if (isExpired) {
    await supabaseAdmin
      .from("org_invitations")
      .update({ status: "expired" })
      .eq("invitation_id", invite.invitation_id);

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07080d] px-4">
        <div className="w-full max-w-[380px] bg-white/[0.02] border border-rose-500/20 rounded-3xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto text-lg">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-white">Expired Invitation</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            This invitation expired after 48 hours. Please contact your organization administrator to receive a new link.
          </p>
          <Link
            href="/auth/login"
            className="block w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white hover:bg-white/10 transition-all text-center"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // 3. Fetch checking variables for Cases logic
  const serverSupabase = await createServerClient();
  const { data: { user: currentUser } } = await serverSupabase.auth.getUser();

  const { data: existingUser } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("email", invite.invited_email)
    .limit(1)
    .maybeSingle();

  // Fetch signup identity provider for the existing user
  let providerName = "Email";
  if (existingUser) {
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(existingUser.user_id);
    if (authUser?.user) {
      const providers = authUser.user.identities?.map((id: any) => id.provider) || [];
      if (providers.includes("google")) {
        providerName = "Google";
      }
    }
  }

  // Evaluate flow scenarios
  const isSessionMatched = currentUser && currentUser.email?.toLowerCase() === invite.invited_email.toLowerCase();
  const hasAccount = !!existingUser;

  // Role Badge Styling mapping
  const roleBadgeStyle =
    invite.role === "org_admin"
      ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
      : invite.role === "analyst"
      ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"; // default auditor

  // Actions functions
  const joinAsExistingAction = async () => {
    "use server";
    if (existingUser) {
      await acceptInvitationForExistingUser(token, existingUser.user_id);
    }
  };

  const logoutAndRetryAction = async () => {
    "use server";
    await logout();
  };

  const loginFirstAction = async () => {
    "use server";
    redirect(`/auth/login?redirectTo=/auth/accept-invite?token=${token}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07080d] px-4 relative overflow-hidden text-white text-[13px]">
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
          
          <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${roleBadgeStyle}`}>
            Joining as: {invite.role}
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-450 text-[11px] text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* Scenarios rendering */}

        {/* Scenario A: User is logged in as the invited email (Case 3) */}
        {isSessionMatched ? (
          <form className="space-y-4" action={joinAsExistingAction}>
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-450 mx-auto" />
              <p className="text-gray-300 leading-relaxed text-xs">
                You are signed in as <span className="text-white font-bold">{currentUser?.user_metadata?.full_name || existingUser?.full_name}</span>. Click below to join.
              </p>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-[0_4px_16px_rgba(16,185,129,0.25)] focus:outline-none transition-all cursor-pointer"
            >
              ACCEPT & JOIN ORGANISATION →
            </button>

            <div className="text-center pt-2">
              <form action={logoutAndRetryAction}>
                <button
                  type="submit"
                  className="text-xs text-gray-500 hover:text-white font-semibold transition-colors cursor-pointer bg-transparent border-none"
                >
                  Not {currentUser?.user_metadata?.full_name || existingUser?.full_name}? Sign out and use correct account
                </button>
              </form>
            </div>
          </form>
        ) : hasAccount ? (
          /* Scenario B: Email has existing account, but not logged in (Case 1) */
          <form className="space-y-4" action={loginFirstAction}>
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

            {/* YOUR ACCOUNT identity card */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-550 uppercase tracking-wider block">
                Your Account
              </label>
              
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-xs">
                    {(existingUser?.full_name || invite.invited_email)[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-white block text-xs">
                      {existingUser?.full_name || "Taylos User"}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Signed in via {providerName}
                    </span>
                  </div>
                </div>
                
                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-gray-400">
                  {providerName.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Accept invite triggers redirect to Login first to authenticate securely */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-[0_4px_16px_rgba(16,185,129,0.25)] focus:outline-none transition-all cursor-pointer"
            >
              ACCEPT & JOIN ORGANISATION →
            </button>

            <div className="text-center pt-2">
              <p className="text-[10px] text-gray-500">
                You will be prompted to verify credentials to log in.
              </p>
            </div>
          </form>
        ) : (
          /* Scenario C: User does NOT have a Taylos account (Case 2) */
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

            {/* Client buttons and conditional inputs wrapper */}
            <AcceptInviteClient token={token} email={invite.invited_email} />
          </form>
        )}

        <div className="mt-5 text-center text-xs text-gray-400 border-t border-white/5 pt-4">
          Already verified?{" "}
          <Link href="/auth/login" className="text-[var(--color-gold-light)] hover:text-white font-semibold transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
