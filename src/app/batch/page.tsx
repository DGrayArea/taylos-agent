import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { BatchManager } from "@/components/batch/BatchManager";

export const metadata: Metadata = {
  title: "Batch Processing",
  description:
    "Submit up to 10,000 financial documents in a single batch job. Track parallel processing progress and download aggregated anomaly results.",
  alternates: { canonical: "https://taylos-agent.vercel.app/batch" },
  openGraph: {
    title: "Batch Processing | Taylos",
    description: "Process thousands of financial documents in parallel. Track progress and download results.",
    url: "https://taylos-agent.vercel.app/batch",
  },
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
