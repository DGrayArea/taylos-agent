// src/lib/comparative.ts
// Feature 7: Comparative Analysis — statistical baseline detection
import { createClient } from "@supabase/supabase-js";
import { ComprehensiveAnalysis } from "@/lib/types";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export interface BaselineStats {
  category: string;
  mean: number;
  stdDev: number;
  sampleCount: number;
}

export interface DriftAlert {
  category: string;
  currentValue: number;
  baseline: BaselineStats;
  zScore: number;
  severity: "critical" | "high" | "medium";
  description: string;
}

function calcMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function calcStdDev(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/** Build statistical baselines from historical reports */
export async function buildBaselines(limit = 30): Promise<Record<string, BaselineStats>> {
  const { data: reports } = await supabaseAdmin
    .from("reports")
    .select("data")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!reports || reports.length < 3) return {};

  const categoryValues: Record<string, number[]> = {};

  for (const row of reports) {
    const analysis = row.data as ComprehensiveAnalysis;
    const spending = analysis?.spending_by_category ?? {};
    for (const [cat, amount] of Object.entries(spending)) {
      if (!categoryValues[cat]) categoryValues[cat] = [];
      categoryValues[cat].push(amount as number);
    }
  }

  const baselines: Record<string, BaselineStats> = {};
  for (const [cat, values] of Object.entries(categoryValues)) {
    const mean = calcMean(values);
    baselines[cat] = {
      category: cat,
      mean,
      stdDev: calcStdDev(values, mean),
      sampleCount: values.length,
    };
  }

  return baselines;
}

/** Detect drift in current analysis vs historical baselines */
export async function detectDrift(
  currentSpending: Record<string, number>,
): Promise<DriftAlert[]> {
  const baselines = await buildBaselines();
  const alerts: DriftAlert[] = [];

  for (const [category, currentValue] of Object.entries(currentSpending)) {
    const baseline = baselines[category];
    if (!baseline || baseline.sampleCount < 3) continue;

    const zScore =
      baseline.stdDev > 0
        ? Math.abs((currentValue - baseline.mean) / baseline.stdDev)
        : 0;

    if (zScore >= 2) {
      const direction = currentValue > baseline.mean ? "increase" : "decrease";
      alerts.push({
        category,
        currentValue,
        baseline,
        zScore,
        severity: zScore >= 3 ? "critical" : zScore >= 2.5 ? "high" : "medium",
        description: `${category} spending shows a ${zScore.toFixed(1)}σ ${direction} vs historical mean of ₦${baseline.mean.toLocaleString()}.`,
      });
    }
  }

  return alerts.sort((a, b) => b.zScore - a.zScore);
}
