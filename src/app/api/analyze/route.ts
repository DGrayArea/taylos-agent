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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payloads: RawDocumentPayload[] = Array.isArray(body.payloads)
      ? body.payloads
      : Array.isArray(body)
      ? body
      : [body];

    if (!payloads || payloads.length === 0) {
      return NextResponse.json({ error: "No document payloads provided." }, { status: 400 });
    }

    // Run the Platform AI Analysis pipeline
    const analysis = await runPlatformAnalysis(payloads);

    return NextResponse.json(analysis, { status: 200 });

  } catch (error: any) {
    console.error("[/api/analyze] Error:", error);
    return NextResponse.json(
      { error: "Analysis failed.", details: error.message },
      { status: 500 }
    );
  }
}
