import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CasesList } from "@/components/cases/CasesList";
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

  const { role, org_id } = await getUserRole(user.id);

  let casesQuery = supabase.from("cases").select("*");
  let reportsQuery = supabase.from("reports").select("id, created_at, data");

  if (role !== "global_admin" && org_id) {
    casesQuery = casesQuery.eq("org_id", org_id);
    reportsQuery = reportsQuery.eq("org_id", org_id);
  } else {
    casesQuery = casesQuery.eq("user_id", user.id);
    reportsQuery = reportsQuery.eq("user_id", user.id);
  }

  const { data: cases } = await casesQuery
    .order("created_at", { ascending: false })
    .limit(200);

  const { data: reports } = await reportsQuery
    .order("created_at", { ascending: false })
    .limit(10);

  return <CasesList initialCases={cases ?? []} reports={reports ?? []} userRole={role || undefined} />;
}
