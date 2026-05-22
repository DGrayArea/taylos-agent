import { createClient } from "@/lib/supabase/server";
import { ReportHistoryTable } from "@/components/history/ReportHistoryTable";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: history } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 pb-24 overflow-x-hidden">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Analysis History
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          Review previously generated intelligence reports and findings.
        </p>
      </div>

      <ReportHistoryTable history={history ?? []} />
    </div>
  );
}
