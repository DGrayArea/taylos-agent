// src/app/lib/prompts.ts
// PURPOSE: All Groq prompt templates live here.
// Keep AI logic OUT of route.ts — import these into your API routes.
//
// WHAT YOU NEED TO DO:
// Fill in the prompt bodies below with your investigation instructions.
// You already wrote the full Feature 3 investigation logic — translate it here
// into natural language for the AI model.

import { Anomaly } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// PROMPT 1: Root Cause Investigation
// Used by: POST /api/investigate
// ─────────────────────────────────────────────────────────────
export function buildInvestigationPrompt(anomaly: Anomaly): string {
  return `
You are a senior financial fraud investigator.

You have been given the following anomaly detected in a financial document:

Anomaly Type: ${anomaly.type}
Severity: ${anomaly.severity}
Description: ${anomaly.description}
Affected Amounts: ${anomaly.affected_amounts.join(", ")}
Evidence: ${anomaly.evidence_points.join("\n - ")}

Your job is to:
1. Write a plain-language summary of what happened (2-3 sentences)
2. Diagnose the most likely root cause (System Error / Fraud / Customer Error / Legitimate)
3. Assign a confidence percentage (0-100%)
4. List the top 3 recommended actions

Respond ONLY in this JSON format:
{
  "summary": "...",
  "root_cause": "...",
  "classification": "BILLING_ERROR | FRAUD | CUSTOMER_ERROR | LEGITIMATE",
  "confidence": 95,
  "recommendations": ["...", "...", "..."]
}
`.trim();
}

// ─────────────────────────────────────────────────────────────
// PROMPT 2: Document Parsing / Extraction
// Used by: POST /api/upload (after raw text is extracted)
// ─────────────────────────────────────────────────────────────
export function buildExtractionPrompt(rawText: string, docType: string): string {
  return `
You are a financial document parser.

Extract all transactions from this ${docType} document.
For each transaction, identify: date, amount, merchant/vendor, direction (debit/credit), and any ID.

Document content:
${rawText.slice(0, 4000)}

Respond ONLY as a JSON array:
[
  { "date": "YYYY-MM-DD", "amount": 0.00, "merchant": "...", "direction": "debit|credit", "id": "..." },
  ...
]
`.trim();
}

// ─────────────────────────────────────────────────────────────
// PROMPT 3: Executive Summary
// Used by: POST /api/analyze (final step)
// ─────────────────────────────────────────────────────────────
export function buildSummaryPrompt(anomalyCount: number, totalAmount: number, criticalCount: number): string {
  return `
You are a financial intelligence agent writing an executive summary.

Analysis results:
- Total anomalies detected: ${anomalyCount}
- Critical issues: ${criticalCount}
- Total affected amount: $${totalAmount.toFixed(2)}

Write a 2-3 sentence professional executive summary of these findings.
Be direct and action-oriented. Respond with plain text only, no JSON.
`.trim();
}
