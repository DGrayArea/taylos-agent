import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/rbac";
import { PublicOverview } from "@/components/layout/PublicOverview";
import { GlobalAdminDashboard } from "@/components/admin/GlobalAdminDashboard";
import { OrgAdminDashboard } from "@/components/org/OrgAdminDashboard";
import { AnalystDashboard } from "@/components/org/AnalystDashboard";
import { AuditorDashboard } from "@/components/org/AuditorDashboard";
import { ShieldAlert, Building, LogOut, ArrowRight } from "lucide-react";
import Link from "next/link";
import { logout } from "./auth/actions";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Review your latest AI-generated financial analysis. See flagged anomalies, duplicate payments, and fraud indicators detected from your documents.",
  alternates: { canonical: "https://taylos-agent.vercel.app" },
  openGraph: {
    title: "Dashboard | Taylos",
    description: "Your latest financial document review — anomalies, confidence scores, and AI findings.",
    url: "https://taylos-agent.vercel.app",
  },
};

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <PublicOverview />;
  }

  const { role, org_id, org_name, status, org_status } = await getUserRole(user.id);

  // 1. Check User/Org Suspensions
  if (status === "suspended") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07080d] px-4 text-center">
        <div className="w-full max-w-[420px] bg-white/[0.02] border border-rose-500/20 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto border border-rose-500/20 animate-pulse">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Account Suspended</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Your personal user account has been suspended by your organisation administrator. 
            Please contact your compliance team or administrator to resolve this issue.
          </p>
          <form action={logout}>
            <button type="submit" className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (org_status === "suspended") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07080d] px-4 text-center">
        <div className="w-full max-w-[420px] bg-white/[0.02] border border-rose-500/20 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto border border-rose-500/20 animate-pulse">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Workspace Suspended</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            The workspace for <span className="text-white font-bold">{org_name}</span> has been suspended by the platform administrator. 
            All actions, API endpoints, and member accesses have been frozen.
          </p>
          <form action={logout}>
            <button type="submit" className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Route based on RBAC Role
  if (role === "global_admin") {
    return <GlobalAdminDashboard />;
  }

  if (role === "org_admin" && org_id) {
    return <OrgAdminDashboard orgId={org_id} orgName={org_name || "Organisation"} />;
  }

  if (role === "analyst" && org_id) {
    return <AnalystDashboard orgId={org_id} orgName={org_name || "Organisation"} />;
  }

  if (role === "auditor" && org_id) {
    return <AuditorDashboard orgId={org_id} orgName={org_name || "Organisation"} />;
  }

  // 3. User logged in but no organisation context (Onboarding)
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07080d] px-4 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.01] bg-[size:30px_30px]" />
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-amber-500/5 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10 bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
          <Building className="w-6 h-6" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome to Taylos</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Your account is verified, but you are not yet associated with any organisation workspace.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href="/auth/register-org"
            className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all cursor-pointer"
          >
            Create New Organisation
            <ArrowRight className="w-4.5 h-4.5" />
          </Link>
          
          <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl text-left text-gray-400 leading-relaxed text-[11px]">
            💡 **Have an invite?** Ask your administrator to invite your email address. Once invited, click the email onboarding link to join.
          </div>
        </div>

        <div className="border-t border-white/5 pt-4">
          <form action={logout}>
            <button type="submit" className="w-full py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer">
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
