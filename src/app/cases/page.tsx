import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CasesList } from "@/components/cases/CasesList";

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

  const { data: cases } = await supabase
    .from("cases")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(200);

  const { data: reports } = await supabase
    .from("reports")
    .select("id, created_at, data")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return <CasesList initialCases={cases ?? []} reports={reports ?? []} />;
}
