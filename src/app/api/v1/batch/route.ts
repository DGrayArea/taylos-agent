// src/app/api/v1/batch/route.ts
// Feature 6: Batch Processing — queue multiple documents, parallel workers
import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/apiKeyAuth";
import { runPlatformAnalysis } from "@/lib/analysis";
import { fireWebhooks } from "@/lib/webhook";
import { logAction } from "@/lib/audit";
import { RawDocumentPayload, ComprehensiveAnalysis } from "@/lib/types";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

const MAX_PARALLEL = 5;

export async function POST(request: Request) {
  const apiKey = request.headers.get("X-API-Key");
  const authResult = await validateApiKey(apiKey);
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  let documents: RawDocumentPayload[][] = [];
  try {
    const body = await request.json();
    // Expects: { documents: RawDocumentPayload[][] } where each inner array is one job
    documents = body.documents ?? (Array.isArray(body) ? body : [[body]]);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (documents.length === 0) {
    return NextResponse.json({ error: "No documents provided." }, { status: 400 });
  }

  if (documents.length > 10000) {
    return NextResponse.json({ error: "Maximum 10,000 document batches allowed." }, { status: 400 });
  }

  // Create batch job record
  const { data: batchRecord } = await supabaseAdmin
    .from("batch_jobs")
    .insert({
      status: "processing",
      document_count: documents.length,
      org_name: authResult.record.org_name,
      source: "batch_api",
    })
    .select("id")
    .single();

  const batchId = batchRecord?.id ?? crypto.randomUUID();

  // Process in parallel chunks of MAX_PARALLEL
  const results: { index: number; status: "fulfilled" | "rejected"; reportId?: string; error?: string }[] = [];

  for (let i = 0; i < documents.length; i += MAX_PARALLEL) {
    const chunk = documents.slice(i, i + MAX_PARALLEL);
    const settled = await Promise.allSettled(
      chunk.map(async (payloads, j) => {
        const analysis = await runPlatformAnalysis(payloads);
        const { data: report } = await supabaseAdmin
          .from("reports")
          .insert({
            date: new Date().toISOString().slice(0, 10),
            documents: payloads.length,
            issues: analysis.feature_2_anomalies.total_anomalies_found,
            status: "Complete",
            data: analysis,
            source: "batch_api",
            batch_id: batchId,
            org_name: authResult.record.org_name,
          })
          .select("id")
          .single();
        return { index: i + j, reportId: report?.id, analysis };
      }),
    );

    for (const [k, result] of settled.entries()) {
      if (result.status === "fulfilled") {
        results.push({ index: i + k, status: "fulfilled", reportId: result.value.reportId });
      } else {
        results.push({ index: i + k, status: "rejected", error: String(result.reason) });
      }
    }
  }

  const successCount = results.filter((r) => r.status === "fulfilled").length;
  const failCount = results.filter((r) => r.status === "rejected").length;

  // Update batch job
  await supabaseAdmin.from("batch_jobs").update({
    status: failCount === documents.length ? "failed" : successCount === documents.length ? "complete" : "partial",
    results: { summary: { total: documents.length, success: successCount, failed: failCount }, jobs: results },
  }).eq("id", batchId);

  await logAction("batch.complete", {
    resourceId: batchId,
    metadata: { total: documents.length, success: successCount, failed: failCount, org: authResult.record.org_name },
  });

  // Fire webhook
  fireWebhooks("batch.complete", { batchId, total: documents.length, success: successCount, failed: failCount }).catch(console.error);

  return NextResponse.json({
    batchId,
    status: failCount === documents.length ? "failed" : successCount === documents.length ? "complete" : "partial",
    summary: { total: documents.length, success: successCount, failed: failCount },
    jobs: results,
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const batchId = searchParams.get("batchId");

  const apiKey = request.headers.get("X-API-Key");
  const authResult = await validateApiKey(apiKey);
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  if (!batchId) {
    // List recent batches for this org
    const { data: jobs } = await supabaseAdmin
      .from("batch_jobs")
      .select("id, status, document_count, results, created_at")
      .eq("org_name", authResult.record.org_name)
      .order("created_at", { ascending: false })
      .limit(20);
    return NextResponse.json({ batches: jobs ?? [] });
  }

  const { data: job } = await supabaseAdmin
    .from("batch_jobs")
    .select("*")
    .eq("id", batchId)
    .maybeSingle();

  if (!job) return NextResponse.json({ error: "Batch not found." }, { status: 404 });
  return NextResponse.json(job);
}
