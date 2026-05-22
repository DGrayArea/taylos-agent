import {
  MasterUnifiedModel,
  UnifiedTransaction,
  UnifiedInvoice,
  UnifiedComplaint,
  Anomaly,
  DetectionResult,
  AnomalySummary,
  SeverityLevel,
} from "../types";

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Intelligent Anomaly Detection Engine for Taylos Agent
 */
export function detectAnomalies(model: MasterUnifiedModel): DetectionResult {
  const { transactions, invoices, complaints, metadata } = model.unified_data;
  const anomalies: Anomaly[] = [];

  // --- CATEGORY A: STRUCTURAL ANOMALIES ---
  detectDuplicates(transactions, anomalies);
  detectInvoiceMismatches(transactions, invoices, anomalies);
  detectTimelineIssues(transactions, invoices, anomalies);
  detectDocumentConflicts(invoices, complaints, anomalies);

  // --- CATEGORY B: PATTERN ANOMALIES ---
  detectPatternAnomalies(transactions, anomalies);
  detectHighRiskMerchants(transactions, anomalies);
  detectGeographicAnomalies(transactions, anomalies);

  // --- CATEGORY C: DATA ANOMALIES ---
  detectDataAnomalies(model, anomalies);

  // Calculate Summary
  const summary: AnomalySummary = {
    total_anomalies: anomalies.length,
    critical_count: anomalies.filter((a) => a.severity === "CRITICAL").length,
    high_count: anomalies.filter((a) => a.severity === "HIGH").length,
    medium_count: anomalies.filter((a) => a.severity === "MEDIUM").length,
    low_count: anomalies.filter((a) => a.severity === "LOW").length,
    total_affected_amount: anomalies.reduce(
      (sum, a) => sum + (a.affected_amounts[0] || 0),
      0,
    ),
  };

  return {
    anomalies_detected: anomalies,
    anomaly_summary: summary,
  };
}

// -----------------------------------------------------------------------------
// CATEGORY A IMPLEMENTATIONS
// -----------------------------------------------------------------------------

function detectDuplicates(
  transactions: UnifiedTransaction[],
  anomalies: Anomaly[],
) {
  const groups: Record<string, UnifiedTransaction[]> = {};
  transactions.forEach((t) => {
    const key = `${t.merchant.toLowerCase()}_${t.amount}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });

  Object.values(groups).forEach((group) => {
    if (group.length < 2) return;
    group.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    for (let i = 0; i < group.length - 1; i++) {
      const t1 = group[i];
      const t2 = group[i + 1];
      const timeDiffMs = Math.abs(
        new Date(t2.date).getTime() - new Date(t1.date).getTime(),
      );
      const hoursDiff = timeDiffMs / (1000 * 60 * 60);

      if (t1.id === t2.id) {
        anomalies.push(
          createAnomaly({
            type: "Duplicate Transaction",
            category: "Structural",
            description: `Transaction ID ${t1.id} appears multiple times in ${t1.source_document} row ${t1.source_line} and ${t2.source_document} row ${t2.source_line}.`,
            affected: [t1.id, t2.id],
            amounts: [t1.amount],
            evidence: [`Exact ID match found`, `Merchant: ${t1.merchant}`],
            relatedDocuments: [t1.source_document, t2.source_document],
            scoring: { deviation: 0, indicators: 30, evidence: 25, impact: 15 },
          }),
        );
      } else if (hoursDiff < 2) {
        anomalies.push(
          createAnomaly({
            type: "Duplicate Transaction",
            category: "Structural",
            description: `Two identical ${formatNaira(t1.amount)} charges were entered ${Math.round(hoursDiff * 60)} minutes apart for ${t1.merchant}. One is in ${t1.source_document} row ${t1.source_line} and the other is in ${t2.source_document} row ${t2.source_line}.`,
            affected: [t1.id, t2.id],
            amounts: [t1.amount],
            evidence: [
              `Same amount (${formatNaira(t1.amount)})`,
              `Same merchant (${t1.merchant})`,
              `${Math.round(hoursDiff * 60)}-minute time gap (retry pattern)`,
            ],
            relatedDocuments: [t1.source_document, t2.source_document],
            scoring: {
              deviation: 30,
              indicators: 30,
              evidence: 20,
              impact: 10,
            },
          }),
        );
      } else if (hoursDiff >= 24 && hoursDiff <= 48) {
        anomalies.push(
          createAnomaly({
            type: "Possible Duplicate",
            category: "Structural",
            description: `Two identical ${formatNaira(t1.amount)} charges at ${t1.merchant} were recorded about 1-2 days apart. Check ${t1.source_document} row ${t1.source_line} and ${t2.source_document} row ${t2.source_line}.`,
            affected: [t1.id, t2.id],
            amounts: [t1.amount],
            evidence: [
              `Suspicious 24-48h interval`,
              `Identical amount and merchant`,
            ],
            relatedDocuments: [t1.source_document, t2.source_document],
            scoring: { deviation: 15, indicators: 20, evidence: 15, impact: 5 },
          }),
        );
      }
    }
  });
}

function detectInvoiceMismatches(
  transactions: UnifiedTransaction[],
  invoices: UnifiedInvoice[],
  anomalies: Anomaly[],
) {
  const outboundTransactions = transactions.filter(
    (t) => t.direction === "debit",
  );
  outboundTransactions.forEach((t) => {
    const matchingInvoice = invoices.find(
      (inv) =>
        inv.vendor.toLowerCase() === t.merchant.toLowerCase() ||
        t.merchant.toLowerCase().includes(inv.vendor.toLowerCase()),
    );

    if (!matchingInvoice) {
      if (t.amount > 100) {
        anomalies.push(
          createAnomaly({
            type: "Orphaned Charge",
            category: "Structural",
            description: `A debit of ${formatNaira(t.amount)} to ${t.merchant} in ${t.source_document} row ${t.source_line} has no matching invoice.`,
            affected: [t.id],
            amounts: [t.amount],
            evidence: [`No invoice found for vendor "${t.merchant}"`],
            relatedDocuments: [t.source_document],
            scoring: {
              deviation: 20,
              indicators: 10,
              evidence: 25,
              impact: 15,
            },
          }),
        );
      }
    } else {
      const diff = Math.abs(t.amount - matchingInvoice.amount);
      const percentDiff = (diff / matchingInvoice.amount) * 100;

      if (percentDiff > 10) {
        anomalies.push(
          createAnomaly({
            type: "Significant Mismatch",
            category: "Structural",
            description: `Invoice ${matchingInvoice.id} shows ${formatNaira(matchingInvoice.amount)}, but the bank statement shows ${formatNaira(t.amount)} for ${t.merchant} in ${t.source_document} row ${t.source_line}.`,
            affected: [t.id, matchingInvoice.id],
            amounts: [t.amount, matchingInvoice.amount],
            evidence: [
              `Amount difference of ${formatNaira(diff)} (${percentDiff.toFixed(1)}%)`,
              `Cross-document conflict`,
            ],
            relatedDocuments: [t.source_document],
            scoring: {
              deviation: 30,
              indicators: 20,
              evidence: 25,
              impact: 10,
            },
          }),
        );
      }
    }
  });
}

function detectTimelineIssues(
  transactions: UnifiedTransaction[],
  invoices: UnifiedInvoice[],
  anomalies: Anomaly[],
) {
  invoices.forEach((inv) => {
    if (new Date(inv.due_date) < new Date(inv.date)) {
      anomalies.push(
        createAnomaly({
          type: "Timeline Inconsistency",
          category: "Structural",
          description: `Invoice ${inv.id} in the system has a due date of ${inv.due_date}, which is before its issue date ${inv.date}.`,
          affected: [inv.id],
          amounts: [inv.amount],
          evidence: [`Timeline logic error`, `Due date < Issue date`],
          relatedDocuments: [inv.id],
          scoring: { deviation: 30, indicators: 15, evidence: 25, impact: 10 },
        }),
      );
    }
  });
}

function detectDocumentConflicts(
  invoices: UnifiedInvoice[],
  complaints: UnifiedComplaint[],
  anomalies: Anomaly[],
) {
  complaints.forEach((c) => {
    if (
      c.text.toLowerCase().includes("not paid") ||
      c.text.toLowerCase().includes("missing payment")
    ) {
      const mentionedVendor = invoices.find((inv) =>
        c.text.toLowerCase().includes(inv.vendor.toLowerCase()),
      );
      if (mentionedVendor && mentionedVendor.status === "paid") {
        anomalies.push(
          createAnomaly({
            type: "Status Conflict",
            category: "Structural",
            description: `Customer complaint says payment was not made, but invoice ${mentionedVendor.id} is recorded as PAID.`,
            affected: [mentionedVendor.id],
            amounts: [mentionedVendor.amount],
            evidence: [`Conflict between invoice status and customer input`],
            relatedDocuments: [mentionedVendor.id],
            scoring: {
              deviation: 20,
              indicators: 25,
              evidence: 20,
              impact: 15,
            },
          }),
        );
      }
    }
  });
}

// -----------------------------------------------------------------------------
// CATEGORY B IMPLEMENTATIONS
// -----------------------------------------------------------------------------

function detectPatternAnomalies(
  transactions: UnifiedTransaction[],
  anomalies: Anomaly[],
) {
  if (transactions.length < 5) return;
  const amounts = transactions.map((t) => t.amount);
  const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const max = Math.max(...amounts);

  transactions.forEach((t) => {
    if (t.amount > max * 0.8 && t.amount > avg * 5) {
      anomalies.push(
        createAnomaly({
          type: "Extreme Outlier",
          category: "Pattern",
          description: `Transaction of ${formatNaira(t.amount)} is more than 5x higher than the account average (${formatNaira(avg)}).`,
          affected: [t.id],
          amounts: [t.amount],
          evidence: [
            `Significant deviation from historical baseline`,
            `Out-of-range amount`,
          ],
          relatedDocuments: [t.source_document],
          scoring: { deviation: 30, indicators: 15, evidence: 20, impact: 15 },
        }),
      );
    }
  });
}

function detectHighRiskMerchants(
  transactions: UnifiedTransaction[],
  anomalies: Anomaly[],
) {
  const highRiskKeywords = [
    "casino",
    "gambling",
    "lotto",
    "adult",
    "wire transfer",
    "crypto exchange",
  ];
  transactions.forEach((t) => {
    const merchant = t.merchant.toLowerCase();
    if (highRiskKeywords.some((kw) => merchant.includes(kw))) {
      anomalies.push(
        createAnomaly({
          type: "Atypical Merchant",
          category: "Pattern",
          description: `Transaction at high-risk merchant ${t.merchant} detected in ${t.source_document} row ${t.source_line}.`,
          affected: [t.id],
          amounts: [t.amount],
          evidence: [`Merchant category matches fraud risk profile`],
          relatedDocuments: [t.source_document],
          scoring: { deviation: 10, indicators: 30, evidence: 20, impact: 15 },
        }),
      );
    }
  });
}

function detectGeographicAnomalies(
  transactions: UnifiedTransaction[],
  anomalies: Anomaly[],
) {
  transactions.forEach((t) => {
    if (
      t.merchant.includes("(INTL)") ||
      t.merchant.includes("SINGAPORE") ||
      t.merchant.includes("LONDON")
    ) {
      anomalies.push(
        createAnomaly({
          type: "Geographic Inconsistency",
          category: "Pattern",
          description: `International transaction from ${t.merchant} was recorded in ${t.source_document} row ${t.source_line} without a travel notice.`,
          affected: [t.id],
          amounts: [t.amount],
          evidence: [`Location mismatch with primary account address`],
          relatedDocuments: [t.source_document],
          scoring: { deviation: 20, indicators: 20, evidence: 15, impact: 10 },
        }),
      );
    }
  });
}

// -----------------------------------------------------------------------------
// CATEGORY C IMPLEMENTATIONS
// -----------------------------------------------------------------------------

function detectDataAnomalies(model: MasterUnifiedModel, anomalies: Anomaly[]) {
  const { metadata, transactions } = model.unified_data;

  // C1: DATA INTEGRITY ISSUES
  if (metadata.parsing_issues.length > 0) {
    anomalies.push(
      createAnomaly({
        type: "Data Integrity Issue",
        category: "Data",
        description: `Critical field or formatting issues were found while parsing input documents. Check the row and column indicated in the parsing issues list.`,
        affected: [],
        amounts: [],
        evidence: metadata.parsing_issues,
        relatedDocuments: [],
        scoring: { deviation: 5, indicators: 10, evidence: 10, impact: 5 },
      }),
    );
  }

  // C2: COMPLETENESS GAPS
  // Check for large gaps in transaction dates
  if (transactions.length > 2) {
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    for (let i = 0; i < sorted.length - 1; i++) {
      const d1 = new Date(sorted[i].date);
      const d2 = new Date(sorted[i + 1].date);
      const dayDiff = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);

      if (dayDiff > 14) {
        // Gap > 2 weeks
        anomalies.push(
          createAnomaly({
            type: "Completeness Gap",
            category: "Data",
            description: `A gap of ${Math.round(dayDiff)} days was found between ${sorted[i].date} and ${sorted[i + 1].date}. Check the statement rows around these dates.`,
            affected: [],
            amounts: [],
            evidence: [
              `Significant gap in transaction history`,
              `Missing days/weeks in statement`,
            ],
            relatedDocuments: [
              sorted[i].source_document,
              sorted[i + 1].source_document,
            ].filter(Boolean) as string[],
            scoring: { deviation: 10, indicators: 15, evidence: 20, impact: 5 },
          }),
        );
      }
    }
  }

  if (metadata.data_gaps.length > 0) {
    anomalies.push(
      createAnomaly({
        type: "Completeness Gap",
        category: "Data",
        description: `Specific gaps were found in the input documents. Please review the listed documents and rows.`,
        affected: [],
        amounts: [],
        evidence: metadata.data_gaps,
        relatedDocuments: [],
        scoring: { deviation: 5, indicators: 10, evidence: 15, impact: 5 },
      }),
    );
  }
}

// -----------------------------------------------------------------------------
// SCORING & HELPERS
// -----------------------------------------------------------------------------

function createAnomaly(params: {
  type: string;
  category: "Structural" | "Pattern" | "Data";
  description: string;
  affected: string[];
  amounts: number[];
  evidence: string[];
  relatedDocuments?: string[];
  scoring: {
    deviation: number;
    indicators: number;
    evidence: number;
    impact: number;
  };
}): Anomaly {
  // Calculate Anomaly Score (0-100)
  const score =
    params.scoring.deviation +
    params.scoring.indicators +
    params.scoring.evidence +
    params.scoring.impact;

  // Determine Severity Level
  let severity: SeverityLevel = "INFORMATIONAL";
  if (score >= 80) severity = "CRITICAL";
  else if (score >= 60) severity = "HIGH";
  else if (score >= 40) severity = "MEDIUM";
  else if (score >= 20) severity = "LOW";

  // Calculate Confidence Level (0-100%)
  // High evidence and high indicators increase confidence
  const confidence = Math.min(
    100,
    Math.round(
      params.evidence.length * 15 + params.scoring.indicators * 1.5 + 20,
    ),
  );

  return {
    id: `ANOM_${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    type: params.type,
    category: params.category,
    severity: severity,
    anomaly_score: score,
    confidence: confidence,
    affected_transactions: params.affected,
    affected_amounts: params.amounts,
    description: params.description,
    evidence_points: params.evidence,
    first_occurrence: new Date().toISOString(), // In real system, take from affected transactions
    related_documents: params.relatedDocuments || [],
  };
}

function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
