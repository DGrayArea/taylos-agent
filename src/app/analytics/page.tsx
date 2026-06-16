// src/app/analytics/page.tsx
// Feature 8: Analytics Dashboard — aggregated metrics, charts, real-time feel
import { createClient } from "@/lib/supabase/server";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export const metadata = {
  title: "Analytics | Taylos Finance",
  description: "Aggregated metrics, confidence trends, and anomaly resolution rates.",
};

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const { data: reports } = await supabase
    .from("reports")
    .select("id, created_at, issues, documents, status, data")
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: cases } = await supabase
    .from("cases")
    .select("id, status, severity, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return <AnalyticsDashboard reports={reports ?? []} cases={cases ?? []} />;
}
