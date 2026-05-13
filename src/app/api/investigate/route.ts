// src/app/api/investigate/route.ts
// PURPOSE: AI-powered root cause investigation for a single anomaly.
// Called after /api/analyze when the user clicks "Investigate" on an anomaly.
//
// PIPELINE:
//   Single Anomaly → Groq AI → AIInvestigationResult
//
// TODO: Once groq.ts is set up, this becomes the live AI endpoint.

import { NextResponse } from "next/server";
import { investigateWithAI } from "@/app/lib/anomaly";
import { Anomaly } from "@/lib/agent/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const anomaly: Anomaly = body.anomaly;

    if (!anomaly || !anomaly.id) {
      return NextResponse.json({ error: "No anomaly provided." }, { status: 400 });
    }

    const result = await investigateWithAI(anomaly);

    return NextResponse.json({ anomaly_id: anomaly.id, investigation: result }, { status: 200 });

  } catch (error: any) {
    console.error("[/api/investigate] Error:", error);
    return NextResponse.json(
      { error: "Investigation failed.", details: error.message },
      { status: 500 }
    );
  }
}
