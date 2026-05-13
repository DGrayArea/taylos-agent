// src/app/lib/anomaly.ts
// PURPOSE: Bridge between your detection engine and Groq AI.
// Your existing `detector.ts` uses pure logic. This file EXTENDS that
// by sending anomalies to Groq for a deeper AI-powered diagnosis.
//
// WHAT YOU NEED TO DO:
// 1. Set up groq.ts first (install SDK + API key)
// 2. Uncomment the Groq call below
// 3. Wire this into your /api/investigate route

import { Anomaly } from "@/lib/agent/types";
import { buildInvestigationPrompt } from "./prompts";

// Import after you set up groq.ts:
// import { groq } from "./groq";

// ─────────────────────────────────────────────────────────────
// AI-Powered Investigation
// ─────────────────────────────────────────────────────────────

export interface AIInvestigationResult {
  summary: string;
  root_cause: string;
  classification: "BILLING_ERROR" | "FRAUD" | "CUSTOMER_ERROR" | "LEGITIMATE";
  confidence: number;
  recommendations: string[];
}

/**
 * Sends an anomaly to Groq for AI-powered root cause analysis.
 * Returns a structured investigation result.
 */
export async function investigateWithAI(
  anomaly: Anomaly
): Promise<AIInvestigationResult> {
  const prompt = buildInvestigationPrompt(anomaly);

  // TODO: Uncomment after setting up groq.ts
  // const response = await groq.chat.completions.create({
  //   model: "llama-3.3-70b-versatile",
  //   messages: [{ role: "user", content: prompt }],
  //   response_format: { type: "json_object" },
  //   temperature: 0.1, // Low temperature = more consistent financial analysis
  // });
  //
  // const content = response.choices[0]?.message?.content ?? "{}";
  // return JSON.parse(content) as AIInvestigationResult;

  // ── MOCK RESPONSE (remove once Groq is connected) ──
  console.warn("[anomaly.ts] Groq not connected. Returning mock result.");
  return {
    summary: anomaly.description,
    root_cause: "Pending AI analysis — connect Groq to enable.",
    classification: "BILLING_ERROR",
    confidence: 0,
    recommendations: ["Connect Groq API to enable AI-powered root cause analysis."],
  };
}

// ─────────────────────────────────────────────────────────────
// Batch Investigation
// ─────────────────────────────────────────────────────────────

/**
 * Investigates multiple anomalies concurrently.
 * Uses Promise.allSettled to avoid one failure blocking the rest.
 */
export async function investigateBatch(
  anomalies: Anomaly[]
): Promise<{ anomaly_id: string; result: AIInvestigationResult | null }[]> {
  const results = await Promise.allSettled(
    anomalies.map((a) => investigateWithAI(a))
  );

  return results.map((r, i) => ({
    anomaly_id: anomalies[i].id,
    result: r.status === "fulfilled" ? r.value : null,
  }));
}
