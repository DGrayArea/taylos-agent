import { createClient } from "@/lib/supabase/server";
import { MonitorDashboard } from "@/components/monitor/MonitorDashboard";

export const metadata = {
  title: "Financial Monitor | Taylos Finance",
  description: "Track transactions across all accounts and detect irregularities in real time.",
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
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Financial Monitor</h1>
        <p className="text-gray-400 text-sm md:text-base">
          A live overview of all reviewed documents, flagged transactions, and running risk totals across your accounts.
        </p>
      </div>
      <MonitorDashboard reports={allReports ?? []} />
    </div>
  );
}
