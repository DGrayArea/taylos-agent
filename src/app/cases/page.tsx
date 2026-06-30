import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CasesList } from "@/components/cases/CasesList";
import { AuditorCasesConsole } from "@/components/org/AuditorCasesConsole";
import { getUserRole } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Cases",
  description:
    "Track, assign, and resolve detected financial anomaly cases. Each case links directly to the flagged transaction and AI finding.",
  alternates: { canonical: "https://taylos-agent.vercel.app/cases" },
  openGraph: {
    title: "Cases | Taylos",
    description: "Manage your anomaly investigation pipeline — open, in-review, and resolved cases.",
    url: "https://taylos-agent.vercel.app/cases",
  },
};

export default async function CasesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { role, org_id, org_name } = await getUserRole(user.id);

  let casesQuery = supabase.from("cases").select("*");

  if (role !== "global_admin" && org_id) {
    casesQuery = casesQuery.eq("org_id", org_id);
  } else {
    casesQuery = casesQuery.eq("user_id", user.id);
  }

  const { data: cases } = await casesQuery
    .order("created_at", { ascending: false })
    .limit(200);

  if (role === "auditor" && org_id) {
    return <AuditorCasesConsole orgId={org_id} orgName={org_name || "Organisation"} cases={cases ?? []} />;
  }

  return <CasesList initialCases={cases ?? []} reports={[]} userRole={role || undefined} />;
}
