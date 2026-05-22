// src/app/api/analyze/route.ts
// PURPOSE: Runs the full detection pipeline on normalized document payloads.
// Receives RawDocumentPayload[] from the client (after /api/upload)
// Returns the ComprehensiveAnalysis (Features 1+2+3 combined).
//
// PIPELINE:
//   payloads → processFinancialData → detectAnomalies → investigations
//   ↓ Returns ComprehensiveAnalysis JSON

import { NextResponse } from "next/server";
import { runPlatformAnalysis } from "@/lib/analysis";
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

    return NextResponse.json(analysis, { status: 200 });
  } catch (error: unknown) {
    console.error("[/api/analyze] Error:", error);
    return NextResponse.json(
      { error: "Analysis failed.", details: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
