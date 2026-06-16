import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MonitorDashboard } from "@/components/monitor/MonitorDashboard";

export const metadata: Metadata = {
  title: "Live Monitor",
  description:
    "Live financial monitoring dashboard. See flagged transaction volumes, risk totals, and anomaly rates across all reviewed accounts in real time.",
  alternates: { canonical: "https://taylos-agent.vercel.app/monitor" },
};

export default async function MonitorPage() {
  const supabase = await createClient();

  // Pull all reports for aggregate stats
  const { data: allReports } = await supabase
    .from("reports")
    .select("id, created_at, documents, issues, data")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 overflow-x-hidden">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Live Monitor</h1>
        <p className="text-gray-400 text-sm md:text-base">
          A live overview of all reviewed documents, flagged transactions, and running risk totals across your accounts.
        </p>
      </header>
      <MonitorDashboard reports={allReports ?? []} />
    </div>
  );
}
