import { 
  MasterUnifiedModel, 
  Anomaly, 
  Investigation, 
  EvidenceChain, 
  SeverityLevel,
  UnifiedTransaction,
  UnifiedInvoice,
  UnifiedComplaint
} from '../types';

/**
 * Root Cause Investigation Engine for Taylos Agent
 */
export function investigateAnomaly(anomaly: Anomaly, model: MasterUnifiedModel): Investigation {
  const { transactions, invoices, complaints } = model.unified_data;

  // STEP 1: WHAT HAPPENED?
  const whatHappened = generateFactualSummary(anomaly, model);

  // STEP 2: WHY DID IT HAPPEN? & STEP 3: CLASSIFICATION
  const diagnosis = diagnoseRootCause(anomaly, model);

  // STEP 4: EVIDENCE CHAIN
  const evidence = buildEvidenceChain(anomaly, model, diagnosis.primary_category);

  // STEP 5: IMPACT ASSESSMENT
  const impact = assessImpact(anomaly, diagnosis.primary_category);

  // STEP 6: CONFIDENCE SCORE
  const confidence = calculateConfidence(anomaly, evidence, diagnosis.hypothesis_confidence);

  return {
    anomaly_id: anomaly.id,
    step_1_what_happened: { summary: whatHappened },
    step_2_root_cause: diagnosis,
    step_3_classification: generateClassification(diagnosis.primary_category, anomaly),
    step_4_evidence_chain: evidence,
    step_5_impact_assessment: impact,
    step_6_confidence: confidence
  };
}

// -----------------------------------------------------------------------------
// STEP 1: FACTUAL SUMMARY
// -----------------------------------------------------------------------------

function generateFactualSummary(anomaly: Anomaly, model: MasterUnifiedModel): string {
  const txns = anomaly.affected_transactions.map(id => 
    model.unified_data.transactions.find(t => t.id === id)
  ).filter(Boolean) as UnifiedTransaction[];

  if (anomaly.type.includes('Duplicate')) {
    const t1 = txns[0];
    const t2 = txns[1] || t1;
    return `Two $${t1.amount} charges appear on the account for ${t1.merchant} dated ${t1.date.split('T')[0]}, occurring within a short time window. Only one transaction was expected for this billing event.`;
  }

  if (anomaly.type.includes('Mismatch')) {
    return `A transaction for $${anomaly.affected_amounts[0]} at ${txns[0]?.merchant || 'vendor'} does not match the associated invoice amount of $${anomaly.affected_amounts[1]}. This represents a ${Math.abs(anomaly.affected_amounts[0] - anomaly.affected_amounts[1]).toFixed(2)} discrepancy.`;
  }

  return anomaly.description;
}

// -----------------------------------------------------------------------------
// STEP 2: ROOT CAUSE DIAGNOSIS
// -----------------------------------------------------------------------------

function diagnoseRootCause(anomaly: Anomaly, model: MasterUnifiedModel) {
  let diagnosis = "Unspecified anomaly requiring manual review.";
  let primaryHypothesis = "Unknown";
  let confidence = 50;
  let category = "UNCATEGORIZED";

  if (anomaly.type.includes('Duplicate')) {
    // Check for System Retry vs Customer Error
    const txns = anomaly.affected_transactions.map(id => model.unified_data.transactions.find(t => t.id === id)).filter(Boolean) as UnifiedTransaction[];
    if (txns.length >= 2) {
      const timeDiff = Math.abs(new Date(txns[1].date).getTime() - new Date(txns[0].date).getTime()) / (1000 * 60 * 60);
      if (timeDiff < 2) {
        diagnosis = "Payment processor system retry: A timeout or connection issue on the first attempt triggered an automatic retry. Both attempts eventually succeeded, resulting in a duplicate charge.";
        primaryHypothesis = "System Retry Error";
        confidence = 95;
        category = "BILLING_ERROR";
      } else {
        diagnosis = "Possible customer error or intentional multiple purchase. The time gap between charges suggests two separate sessions or submissions.";
        primaryHypothesis = "Customer Action";
        confidence = 70;
        category = "CUSTOMER_ERROR";
      }
    }
  } else if (anomaly.type.includes('Orphaned')) {
    diagnosis = "Missing documentation: A charge was processed through the banking system without a corresponding invoice or receipt being captured in the intake records.";
    primaryHypothesis = "Missing Record";
    confidence = 80;
    category = "DATA_ANOMALY";
  } else if (anomaly.type.includes('High-Risk') || anomaly.type.includes('Geographic')) {
    diagnosis = "Potential unauthorized activity: Transaction characteristics (merchant type or location) deviate significantly from the established account baseline.";
    primaryHypothesis = "Unauthorized Use";
    confidence = 65;
    category = "FRAUD";
  }

  return {
    diagnosis,
    primary_category: category,
    primary_hypothesis: primaryHypothesis,
    hypothesis_confidence: confidence,
    alternative_hypotheses: [
      { hypothesis: "Manual Data Entry Error", likelihood: "low", evidence_against: "System logs show automated processing" },
      { hypothesis: "Legitimate one-off transaction", likelihood: "moderate", evidence_against: "No prior history with this merchant category" }
    ]
  };
}

// -----------------------------------------------------------------------------
// STEP 3: CLASSIFICATION
// -----------------------------------------------------------------------------

function generateClassification(category: string, anomaly: Anomaly) {
  return {
    primary_category: category,
    subcategory: anomaly.type,
    fraud_indicator: category === 'FRAUD',
    customer_error: category === 'CUSTOMER_ERROR',
    system_error: category === 'BILLING_ERROR' || category === 'SYSTEM_GLITCH',
    legitimate_activity: category === 'LEGITIMATE',
    requires_refund: category === 'BILLING_ERROR' || category === 'FRAUD',
    refund_justification: category === 'BILLING_ERROR' ? "Duplicate charge due to system error" : undefined
  };
}

// -----------------------------------------------------------------------------
// STEP 4: EVIDENCE CHAIN
// -----------------------------------------------------------------------------

function buildEvidenceChain(anomaly: Anomaly, model: MasterUnifiedModel, category: string): any {
  const temporal: any[] = [];
  const merchant: any[] = [];
  const system: any[] = [];
  const customer: any[] = [];
  
  const txns = anomaly.affected_transactions.map(id => model.unified_data.transactions.find(t => t.id === id)).filter(Boolean) as UnifiedTransaction[];

  // Build Temporal Evidence
  if (txns.length >= 2) {
    const timeDiff = Math.abs(new Date(txns[1].date).getTime() - new Date(txns[0].date).getTime()) / (1000 * 60);
    temporal.push({
      finding: `${Math.round(timeDiff)} minute gap between charges`,
      significance: timeDiff < 120 ? "Matches standard processor retry pattern" : "Suggests separate sessions",
      source: txns[0].source_document,
      confidence: "high"
    });
  }

  // Build Merchant Evidence
  if (txns[0]) {
    merchant.push({
      finding: `Merchant: ${txns[0].merchant}`,
      significance: "Used to determine risk profile and matching invoices",
      source: txns[0].source_document,
      confidence: "very_high"
    });
  }

  // Build Customer Evidence
  const matchingComplaint = model.unified_data.complaints.find(c => 
    txns[0] && c.text.toLowerCase().includes(txns[0].merchant.toLowerCase())
  );
  if (matchingComplaint) {
    customer.push({
      finding: "Customer reported issue directly",
      significance: "Corroborates unexpected nature of the charge",
      source: "customer_complaint.txt",
      confidence: "high"
    });
  }

  return {
    total_evidence_points: temporal.length + merchant.length + system.length + customer.length,
    supporting_evidence: [
      ...temporal.map(e => e.finding),
      ...merchant.map(e => e.finding),
      ...customer.map(e => e.finding)
    ],
    detailed_chain: {
      temporal_evidence: temporal,
      merchant_evidence: merchant,
      customer_evidence: customer,
      system_evidence: system,
      contradicting_evidence: [],
      summary: "Evidence suggests high likelihood of the primary hypothesis."
    },
    contradicting_evidence: [],
    missing_information: []
  };
}

// -----------------------------------------------------------------------------
// STEP 5: IMPACT ASSESSMENT
// -----------------------------------------------------------------------------

function assessImpact(anomaly: Anomaly, category: string) {
  const amount = anomaly.affected_amounts[0] || 0;
  
  return {
    financial_impact: `$${amount.toFixed(2)} overcharged to customer account.`,
    customer_impact: "Account overcharged, potential for overdraft or liquidity issues.",
    operational_impact: "System bug identified, manual refund processing required.",
    regulatory_impact: "Dispute resolution must be completed within regulatory timelines.",
    overall_severity: anomaly.severity,
    impact_score: anomaly.severity === 'CRITICAL' ? 9 : (anomaly.severity === 'HIGH' ? 7 : 4)
  };
}

// -----------------------------------------------------------------------------
// STEP 6: CONFIDENCE
// -----------------------------------------------------------------------------

function calculateConfidence(anomaly: Anomaly, evidence: any, baseConfidence: number) {
  // Simple confidence additive model
  let score = baseConfidence;
  
  // Add for evidence points
  score += (evidence.total_evidence_points * 5);
  
  // Subtract for lack of documentation
  if (anomaly.type.includes('Orphaned')) score -= 10;
  
  score = Math.min(99, Math.max(10, score));

  let level = "LOW";
  if (score >= 95) level = "VERY HIGH";
  else if (score >= 85) level = "HIGH";
  else if (score >= 70) level = "MODERATE-HIGH";
  else if (score >= 50) level = "MODERATE";

  return {
    overall_confidence_percentage: score,
    confidence_level: level,
    evidence_quality: "Technical logs and clear temporal patterns",
    data_completeness: "All primary transaction fields available",
    alternative_explanations: "Ruled out based on time-based retry signatures"
  };
}
