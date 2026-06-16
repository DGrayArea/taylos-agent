// src/app/batch/page.tsx
// Feature 6: Batch Processing UI
import { createClient } from "@/lib/supabase/server";
import { BatchManager } from "@/components/batch/BatchManager";

export const metadata = {
  title: "Batch Processing | Taylos Finance",
  description: "Submit and track parallel document analysis jobs at scale.",
};

export default async function BatchPage() {
  const supabase = await createClient();

  const { data: jobs } = await supabase
    .from("batch_jobs")
    .select("id, status, document_count, results, created_at, source")
    .order("created_at", { ascending: false })
    .limit(50);

  return <BatchManager initialJobs={jobs ?? []} />;
}
