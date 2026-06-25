import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export const metadata: Metadata = {
  title: "Analytics",
  description:
    "Aggregated financial intelligence metrics — anomaly trends, AI confidence scores, severity breakdowns, and case resolution rates across all reviewed documents.",
  alternates: { canonical: "https://taylos-agent.vercel.app/analytics" },
  openGraph: {
    title: "Analytics | Taylos",
    description: "Aggregated anomaly trends, confidence scores, and case resolution rates.",
    url: "https://taylos-agent.vercel.app/analytics",
  },
};

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: reports } = await supabase
    .from("reports")
    .select("id, created_at, issues, documents, status, data")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: cases } = await supabase
    .from("cases")
    .select("id, status, severity, created_at")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(200);

  return <AnalyticsDashboard reports={reports ?? []} cases={cases ?? []} />;
}
