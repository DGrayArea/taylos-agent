// src/app/api/analyze/route.ts
// PURPOSE: Runs the full detection pipeline on normalized document payloads.
// Now includes: webhook notifications + audit logging after each analysis.

import { NextResponse } from "next/server";
import { runPlatformAnalysis } from "@/lib/analysis";
import { fireWebhooks } from "@/lib/webhook";
import { logAction } from "@/lib/audit";
import { storeAnomalyEmbedding } from "@/lib/vectorStore";
import { RawDocumentPayload } from "@/lib/types";

type AnalyzeRequestBody =
  | { payloads?: RawDocumentPayload[] }
  | RawDocumentPayload[];

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function getPayloads(body: unknown): RawDocumentPayload[] {
  if (Array.isArray(body)) {
    return body as RawDocumentPayload[];
  }
  if (typeof body === "object" && body !== null && "payloads" in body) {
    const payloadContainer = body as { payloads?: unknown };
    if (Array.isArray(payloadContainer.payloads)) {
      return payloadContainer.payloads as RawDocumentPayload[];
    }
  }
  return [body as RawDocumentPayload];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const payloads: RawDocumentPayload[] = getPayloads(body);

    if (!payloads || payloads.length === 0) {
      return NextResponse.json(
        { error: "No document payloads provided." },
        { status: 400 },
      );
    }

    // Run the Platform AI Analysis pipeline
    const analysis = await runPlatformAnalysis(payloads);

    // Log action (non-blocking)
    logAction("analysis.complete", {
      metadata: {
        documents: payloads.length,
        anomalies: analysis.feature_2_anomalies.total_anomalies_found,
        source: "dashboard",
      },
    }).catch(console.error);

    // Fire webhooks for downstream integrations (non-blocking)
    fireWebhooks("analysis.complete", {
      anomalyCount: analysis.feature_2_anomalies.total_anomalies_found,
      summary: analysis.executive_summary,
    }).catch(console.error);

    // Store embeddings for pattern learning (non-blocking)
    for (const anomaly of analysis.feature_2_anomalies.anomaly_list.slice(0, 5)) {
      storeAnomalyEmbedding(anomaly.id, "latest", anomaly).catch(console.error);
    }

    return NextResponse.json(analysis, { status: 200 });
  } catch (error: unknown) {
    console.error("[/api/analyze] Error:", error);
    return NextResponse.json(
      { error: "Analysis failed.", details: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
