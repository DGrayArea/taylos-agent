// src/app/api/v1/analyze/route.ts
// Feature 1: Public REST API endpoint with API key auth + rate limiting
import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/apiKeyAuth";
import { runPlatformAnalysis } from "@/lib/analysis";
import { fireWebhooks } from "@/lib/webhook";
import { logAction } from "@/lib/audit";
import { maskPII } from "@/lib/privacy";
import { RawDocumentPayload } from "@/lib/types";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export async function POST(request: Request) {
  // 1. Auth
  const apiKey = request.headers.get("X-API-Key");
  const authResult = await validateApiKey(apiKey);

  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  // 2. Parse body
  let payloads: RawDocumentPayload[] = [];
  try {
    const body = await request.json();
    payloads = Array.isArray(body) ? body : body.payloads ?? [body];
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!payloads || payloads.length === 0) {
    return NextResponse.json({ error: "No document payloads provided." }, { status: 400 });
  }

  // Create a job record
  const { data: job } = await supabaseAdmin
    .from("batch_jobs")
    .insert({
      status: "processing",
      document_count: payloads.length,
      org_name: authResult.record.org_name,
      source: "rest_api",
    })
    .select("id")
    .single();

  const jobId = job?.id ?? crypto.randomUUID();

  // 3. Run analysis
  let analysis;
  try {
    analysis = await runPlatformAnalysis(payloads);
  } catch (err) {
    await supabaseAdmin.from("batch_jobs").update({ status: "failed" }).eq("id", jobId);
    return NextResponse.json({ error: "Analysis failed.", jobId }, { status: 500 });
  }

  // 4. Store result
  const { data: report } = await supabaseAdmin
    .from("reports")
    .insert({
      date: new Date().toISOString().slice(0, 10),
      documents: payloads.length,
      issues: analysis.feature_2_anomalies.total_anomalies_found,
      status: "Complete",
      data: analysis,
      source: "rest_api",
      org_name: authResult.record.org_name,
    })
    .select("id")
    .single();

  await supabaseAdmin.from("batch_jobs").update({ status: "complete", results: { reportId: report?.id } }).eq("id", jobId);

  // 5. Audit
  await logAction("analysis.complete", {
    resourceType: "report",
    resourceId: report?.id,
    metadata: { source: "rest_api", org: authResult.record.org_name, anomalies: analysis.feature_2_anomalies.total_anomalies_found },
  });

  // 6. Fire webhooks (non-blocking)
  fireWebhooks("analysis.complete", {
    reportId: report?.id,
    jobId,
    anomalyCount: analysis.feature_2_anomalies.total_anomalies_found,
    summary: analysis.executive_summary,
  }).catch(console.error);

  // 7. Return structured response (PII-safe)
  return NextResponse.json({
    jobId,
    reportId: report?.id,
    status: "complete",
    anomalies: analysis.feature_2_anomalies.anomaly_list.map((a) => ({
      id: a.id,
      type: a.type,
      severity: a.severity,
      confidence: a.confidence,
      description: maskPII(a.description),
      financial_impact: a.financial_impact,
      recommended_action: a.recommended_action,
    })),
    classifications: {
      critical: analysis.feature_2_anomalies.anomalies_by_severity.critical,
      high: analysis.feature_2_anomalies.anomalies_by_severity.high,
      medium: analysis.feature_2_anomalies.anomalies_by_severity.medium,
      low: analysis.feature_2_anomalies.anomalies_by_severity.low,
    },
    confidence_scores: analysis.feature_2_anomalies.anomaly_list.map((a) => ({
      id: a.id,
      confidence: a.confidence,
      anomaly_score: a.anomaly_score,
    })),
    executive_summary: analysis.executive_summary,
    processing_time_seconds: analysis.analysis_metadata.total_processing_time_seconds,
  });
}

export async function GET() {
  return NextResponse.json({
    api: "Taylos Agent REST API",
    version: "v1",
    endpoints: {
      "POST /api/v1/analyze": "Submit documents for analysis",
      "GET /api/v1/status/:jobId": "Poll job status",
      "POST /api/v1/batch": "Submit multiple documents as batch",
      "GET /api/v1/export/csv?reportId=": "Export report as CSV",
    },
    authentication: "X-API-Key header required",
    rateLimit: "Configurable per API key (default: 100 req/hour)",
  });
}
