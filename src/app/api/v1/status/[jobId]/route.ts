// src/app/api/v1/status/[jobId]/route.ts
// Feature 1: Job status polling endpoint
import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/apiKeyAuth";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  const apiKey = request.headers.get("X-API-Key");
  const authResult = await validateApiKey(apiKey);

  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { data: job } = await supabaseAdmin
    .from("batch_jobs")
    .select("id, status, document_count, results, created_at")
    .eq("id", jobId)
    .maybeSingle();

  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  return NextResponse.json({
    jobId: job.id,
    status: job.status,
    documentCount: job.document_count,
    results: job.results,
    createdAt: job.created_at,
  });
}
