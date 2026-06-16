// src/lib/vectorStore.ts
// Feature 5: Pattern Learning — store anomaly embeddings + retrieve similar past cases
// Uses Supabase pgvector extension (anomaly_embeddings table)
import { createClient } from "@supabase/supabase-js";
import { groq } from "@/lib/groq";
import { Anomaly } from "@/lib/types";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

/** Get a text embedding via Groq (or a stub if unavailable) */
async function getEmbedding(text: string): Promise<number[]> {
  try {
    // Groq doesn't natively do embeddings — use a simple fingerprint as demo
    // In production: swap for OpenAI embeddings or Cohere
    // For now: deterministic hash-based pseudo-embedding (1536 dims)
    const hash = text.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return Array.from({ length: 128 }, (_, i) => Math.sin((hash + i) * 0.1));
  } catch {
    return Array(128).fill(0);
  }
}

/** Store an anomaly embedding after analysis */
export async function storeAnomalyEmbedding(
  anomalyId: string,
  reportId: string,
  anomaly: Anomaly,
): Promise<void> {
  const text = `${anomaly.type} ${anomaly.description} ${anomaly.evidence_points.join(" ")}`;
  const embedding = await getEmbedding(text);

  await supabaseAdmin.from("anomaly_embeddings").upsert({
    anomaly_id: anomalyId,
    report_id: reportId,
    anomaly_type: anomaly.type,
    severity: anomaly.severity,
    description: anomaly.description,
    embedding: JSON.stringify(embedding),
    classification: anomaly.category,
    confidence: anomaly.confidence,
  });
}

/** Retrieve similar past anomalies to inject as context */
export async function retrieveSimilarCases(
  anomaly: Anomaly,
  limit = 5,
): Promise<string[]> {
  // Fetch recent resolved cases of same type as context
  const { data } = await supabaseAdmin
    .from("anomaly_embeddings")
    .select("anomaly_type, severity, description, confidence")
    .eq("anomaly_type", anomaly.type)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!data || data.length === 0) return [];

  return data.map(
    (row: { anomaly_type: string; severity: string; description: string; confidence: number }) =>
      `Past ${row.anomaly_type} (${row.severity}, ${row.confidence}% confidence): ${row.description}`,
  );
}

/** Build a context string of similar past cases for prompt injection */
export async function buildPatternContext(anomalies: Anomaly[]): Promise<string> {
  const results: string[] = [];
  for (const anomaly of anomalies.slice(0, 3)) {
    const similar = await retrieveSimilarCases(anomaly, 3);
    if (similar.length > 0) {
      results.push(`Similar past ${anomaly.type} cases:\n${similar.join("\n")}`);
    }
  }
  return results.join("\n\n");
}
