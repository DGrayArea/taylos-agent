import { 
  MasterUnifiedModel, 
  UnifiedTransaction, 
  UnifiedInvoice, 
  UnifiedComplaint,
  Anomaly,
  DetectionResult,
  AnomalySummary,
  SeverityLevel
} from '../types';

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
    critical_count: anomalies.filter(a => a.severity === 'CRITICAL').length,
    high_count: anomalies.filter(a => a.severity === 'HIGH').length,
    medium_count: anomalies.filter(a => a.severity === 'MEDIUM').length,
    low_count: anomalies.filter(a => a.severity === 'LOW').length,
    total_affected_amount: anomalies.reduce((sum, a) => sum + (a.affected_amounts[0] || 0), 0)
  };

  return {
    anomalies_detected: anomalies,
    anomaly_summary: summary
  };
}

// -----------------------------------------------------------------------------
// CATEGORY A IMPLEMENTATIONS
// -----------------------------------------------------------------------------

function detectDuplicates(transactions: UnifiedTransaction[], anomalies: Anomaly[]) {
  const groups: Record<string, UnifiedTransaction[]> = {};
  transactions.forEach(t => {
    const key = `${t.merchant.toLowerCase()}_${t.amount}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });

  Object.values(groups).forEach(group => {
    if (group.length < 2) return;
    group.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (let i = 0; i < group.length - 1; i++) {
      const t1 = group[i];
      const t2 = group[i+1];
      const timeDiffMs = Math.abs(new Date(t2.date).getTime() - new Date(t1.date).getTime());
      const hoursDiff = timeDiffMs / (1000 * 60 * 60);

      if (t1.id === t2.id) {
        anomalies.push(createAnomaly({
          type: 'Duplicate Transaction',
          category: 'Structural',
          description: `Transaction ID ${t1.id} appears multiple times in logs.`,
          affected: [t1.id, t2.id],
          amounts: [t1.amount],
          evidence: [`Exact ID match found`, `Merchant: ${t1.merchant}`],
          scoring: { deviation: 0, indicators: 30, evidence: 25, impact: 15 } // Confirmed duplicate
        }));
      } else if (hoursDiff < 2) {
        anomalies.push(createAnomaly({
          type: 'Duplicate Transaction',
          category: 'Structural',
          description: `Two identical $${t1.amount} charges detected ${Math.round(hoursDiff * 60)} minutes apart from ${t1.merchant}`,
          affected: [t1.id, t2.id],
          amounts: [t1.amount],
          evidence: [`Same amount ($${t1.amount})`, `Same merchant (${t1.merchant})`, `${Math.round(hoursDiff * 60)}-minute time gap (retry pattern)`],
          scoring: { deviation: 30, indicators: 30, evidence: 20, impact: 10 }
        }));
      } else if (hoursDiff >= 24 && hoursDiff <= 48) {
        anomalies.push(createAnomaly({
          type: 'Possible Duplicate',
          category: 'Structural',
          description: `Two identical charges of $${t1.amount} at ${t1.merchant} roughly 24-48 hours apart.`,
          affected: [t1.id, t2.id],
          amounts: [t1.amount],
          evidence: [`Suspicious 24-48h interval`, `Identical amount and merchant`],
          scoring: { deviation: 15, indicators: 20, evidence: 15, impact: 5 }
        }));
      }
    }
  });
}

function detectInvoiceMismatches(transactions: UnifiedTransaction[], invoices: UnifiedInvoice[], anomalies: Anomaly[]) {
  const outboundTransactions = transactions.filter(t => t.direction === 'debit');
  outboundTransactions.forEach(t => {
    const matchingInvoice = invoices.find(inv => 
      inv.vendor.toLowerCase() === t.merchant.toLowerCase() || 
      t.merchant.toLowerCase().includes(inv.vendor.toLowerCase())
    );

    if (!matchingInvoice) {
      if (t.amount > 100) {
        anomalies.push(createAnomaly({
          type: 'Orphaned Charge',
          category: 'Structural',
          description: `Transaction for $${t.amount} at ${t.merchant} has no matching invoice in the system.`,
          affected: [t.id],
          amounts: [t.amount],
          evidence: [`No invoice found for vendor "${t.merchant}"`],
          scoring: { deviation: 20, indicators: 10, evidence: 25, impact: 15 }
        }));
      }
    } else {
      const diff = Math.abs(t.amount - matchingInvoice.amount);
      const percentDiff = (diff / matchingInvoice.amount) * 100;

      if (percentDiff > 10) {
        anomalies.push(createAnomaly({
          type: 'Significant Mismatch',
          category: 'Structural',
          description: `Invoice for ${matchingInvoice.vendor} shows $${matchingInvoice.amount}, but statement shows $${t.amount}.`,
          affected: [t.id, matchingInvoice.id],
          amounts: [t.amount, matchingInvoice.amount],
          evidence: [`Amount difference of $${diff.toFixed(2)} (${percentDiff.toFixed(1)}%)`, `Cross-document conflict`],
          scoring: { deviation: 30, indicators: 20, evidence: 25, impact: 10 }
        }));
      }
    }
  });
}

function detectTimelineIssues(transactions: UnifiedTransaction[], invoices: UnifiedInvoice[], anomalies: Anomaly[]) {
  invoices.forEach(inv => {
    if (new Date(inv.due_date) < new Date(inv.date)) {
      anomalies.push(createAnomaly({
        type: 'Timeline Inconsistency',
        category: 'Structural',
        description: `Invoice ${inv.id} has a due date (${inv.due_date}) before its issue date (${inv.date}).`,
        affected: [inv.id],
        amounts: [inv.amount],
        evidence: [`Timeline logic error`, `Due date < Issue date`],
        scoring: { deviation: 30, indicators: 15, evidence: 25, impact: 10 }
      }));
    }
  });
}

function detectDocumentConflicts(invoices: UnifiedInvoice[], complaints: UnifiedComplaint[], anomalies: Anomaly[]) {
  complaints.forEach(c => {
    if (c.text.toLowerCase().includes('not paid') || c.text.toLowerCase().includes('missing payment')) {
      const mentionedVendor = invoices.find(inv => c.text.toLowerCase().includes(inv.vendor.toLowerCase()));
      if (mentionedVendor && mentionedVendor.status === 'paid') {
        anomalies.push(createAnomaly({
          type: 'Status Conflict',
          category: 'Structural',
          description: `Customer reports missing payment, but Invoice ${mentionedVendor.id} is marked as PAID.`,
          affected: [mentionedVendor.id],
          amounts: [mentionedVendor.amount],
          evidence: [`Conflict between invoice status and customer input`],
          scoring: { deviation: 20, indicators: 25, evidence: 20, impact: 15 }
        }));
      }
    }
  });
}

// -----------------------------------------------------------------------------
// CATEGORY B IMPLEMENTATIONS
// -----------------------------------------------------------------------------

function detectPatternAnomalies(transactions: UnifiedTransaction[], anomalies: Anomaly[]) {
  if (transactions.length < 5) return;
  const amounts = transactions.map(t => t.amount);
  const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const max = Math.max(...amounts);

  transactions.forEach(t => {
    if (t.amount > max * 0.8 && t.amount > avg * 5) {
      anomalies.push(createAnomaly({
        type: 'Extreme Outlier',
        category: 'Pattern',
        description: `Transaction of $${t.amount} is 5x higher than the account average ($${avg.toFixed(2)}).`,
        affected: [t.id],
        amounts: [t.amount],
        evidence: [`Significant deviation from historical baseline`, `Out-of-range amount`],
        scoring: { deviation: 30, indicators: 15, evidence: 20, impact: 15 }
      }));
    }
  });
}

function detectHighRiskMerchants(transactions: UnifiedTransaction[], anomalies: Anomaly[]) {
  const highRiskKeywords = ['casino', 'gambling', 'lotto', 'adult', 'wire transfer', 'crypto exchange'];
  transactions.forEach(t => {
    const merchant = t.merchant.toLowerCase();
    if (highRiskKeywords.some(kw => merchant.includes(kw))) {
      anomalies.push(createAnomaly({
        type: 'Atypical Merchant',
        category: 'Pattern',
        description: `Transaction at known high-risk merchant: ${t.merchant}.`,
        affected: [t.id],
        amounts: [t.amount],
        evidence: [`Merchant category matches fraud risk profile`],
        scoring: { deviation: 10, indicators: 30, evidence: 20, impact: 15 }
      }));
    }
  });
}

function detectGeographicAnomalies(transactions: UnifiedTransaction[], anomalies: Anomaly[]) {
  transactions.forEach(t => {
    if (t.merchant.includes('(INTL)') || t.merchant.includes('SINGAPORE') || t.merchant.includes('LONDON')) {
      anomalies.push(createAnomaly({
        type: 'Geographic Inconsistency',
        category: 'Pattern',
        description: `International transaction detected from ${t.merchant} without prior travel notice.`,
        affected: [t.id],
        amounts: [t.amount],
        evidence: [`Location mismatch with primary account address`],
        scoring: { deviation: 20, indicators: 20, evidence: 15, impact: 10 }
      }));
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
    anomalies.push(createAnomaly({
      type: 'Data Integrity Issue',
      category: 'Data',
      description: `Critical fields or formatting issues found during document parsing.`,
      affected: [],
      amounts: [],
      evidence: metadata.parsing_issues,
      scoring: { deviation: 5, indicators: 10, evidence: 10, impact: 5 }
    }));
  }

  // C2: COMPLETENESS GAPS
  // Check for large gaps in transaction dates
  if (transactions.length > 2) {
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    for (let i = 0; i < sorted.length - 1; i++) {
      const d1 = new Date(sorted[i].date);
      const d2 = new Date(sorted[i+1].date);
      const dayDiff = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);

      if (dayDiff > 14) { // Gap > 2 weeks
        anomalies.push(createAnomaly({
          type: 'Completeness Gap',
          category: 'Data',
          description: `Statement gap of ${Math.round(dayDiff)} days detected between ${sorted[i].date} and ${sorted[i+1].date}.`,
          affected: [],
          amounts: [],
          evidence: [`Significant gap in transaction history`, `Missing days/weeks in statement`],
          scoring: { deviation: 10, indicators: 15, evidence: 20, impact: 5 }
        }));
      }
    }
  }

  if (metadata.data_gaps.length > 0) {
    anomalies.push(createAnomaly({
      type: 'Completeness Gap',
      category: 'Data',
      description: `Specific gaps identified in the input data sources.`,
      affected: [],
      amounts: [],
      evidence: metadata.data_gaps,
      scoring: { deviation: 5, indicators: 10, evidence: 15, impact: 5 }
    }));
  }
}

// -----------------------------------------------------------------------------
// SCORING & HELPERS
// -----------------------------------------------------------------------------

function createAnomaly(params: {
  type: string, 
  category: 'Structural' | 'Pattern' | 'Data', 
  description: string, 
  affected: string[], 
  amounts: number[], 
  evidence: string[],
  scoring: { deviation: number, indicators: number, evidence: number, impact: number }
}): Anomaly {
  
  // Calculate Anomaly Score (0-100)
  const score = params.scoring.deviation + params.scoring.indicators + params.scoring.evidence + params.scoring.impact;
  
  // Determine Severity Level
  let severity: SeverityLevel = 'INFORMATIONAL';
  if (score >= 80) severity = 'CRITICAL';
  else if (score >= 60) severity = 'HIGH';
  else if (score >= 40) severity = 'MEDIUM';
  else if (score >= 20) severity = 'LOW';

  // Calculate Confidence Level (0-100%)
  // High evidence and high indicators increase confidence
  const confidence = Math.min(100, Math.round((params.evidence.length * 15) + (params.scoring.indicators * 1.5) + 20));

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
    related_documents: []
  };
}

function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
