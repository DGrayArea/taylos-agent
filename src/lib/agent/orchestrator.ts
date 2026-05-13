import { 
  RawDocumentPayload, 
  ComprehensiveAnalysis, 
  MasterUnifiedModel,
  Investigation,
  SeverityLevel
} from './types';
import { processFinancialData } from './dataIntake';
import { investigateAnomaly } from './investigator';

/**
 * Main Entry Point for Taylos Agent Financial Intelligence Analysis
 * Unifies Feature 1 (Intake), Feature 2 (Detection), and Feature 3 (Investigation).
 */
export function analyzeFinancialData(payloads: RawDocumentPayload[]): ComprehensiveAnalysis {
  const startTime = Date.now();

  // 1. Feature 1 & 2: Intake and Detection
  // (processFinancialData already calls detectAnomalies internally)
  const unifiedModel: MasterUnifiedModel = processFinancialData(payloads);
  const detectedAnomalies = unifiedModel.unified_data.anomalies?.anomalies_detected || [];

  // 2. Feature 3: Investigations
  const investigations: Investigation[] = detectedAnomalies.map(anomaly => 
    investigateAnomaly(anomaly, unifiedModel)
  );

  // 3. Generate Recommendations
  const recommendations = generateRecommendations(investigations);

  // 4. Generate Executive Summary
  const executiveSummary = generateExecutiveSummary(investigations, unifiedModel);

  const endTime = Date.now();
  const processingTime = (endTime - startTime) / 1000;

  // 5. Final Comprehensive Output
  return {
    analysis_metadata: {
      analysis_date: new Date().toISOString(),
      analysis_version: "1.0",
      total_processing_time_seconds: processingTime,
      data_quality_score: unifiedModel.unified_data.metadata.data_quality_score,
      documents_processed: payloads.length,
      total_transactions_analyzed: unifiedModel.unified_data.transactions.length
    },
    feature_1_data_intake: unifiedModel,
    feature_2_anomalies: {
      total_anomalies_found: detectedAnomalies.length,
      anomalies_by_severity: {
        critical: detectedAnomalies.filter(a => a.severity === 'CRITICAL').length,
        high: detectedAnomalies.filter(a => a.severity === 'HIGH').length,
        medium: detectedAnomalies.filter(a => a.severity === 'MEDIUM').length,
        low: detectedAnomalies.filter(a => a.severity === 'LOW').length
      },
      anomaly_list: detectedAnomalies
    },
    feature_3_investigations: {
      investigations
    },
    recommendations,
    executive_summary: executiveSummary
  };
}

function generateRecommendations(investigations: Investigation[]) {
  const primaryRec = investigations.some(i => i.step_3_classification.requires_refund)
    ? "APPROVE REFUND(S) for identified billing errors and fraud indicators."
    : "Review identified data quality gaps and monitor account for further anomalies.";

  const secondaryActions: string[] = [];
  if (investigations.some(i => i.step_3_classification.primary_category === 'BILLING_ERROR')) {
    secondaryActions.push("Escalate to payment processor for retry bug investigation.");
    secondaryActions.push("Check for other customers affected by same processor timeout.");
  }
  if (investigations.some(i => i.step_3_classification.primary_category === 'FRAUD')) {
    secondaryActions.push("Freeze affected account and initiate secondary verification.");
  }
  if (investigations.some(i => i.step_3_classification.primary_category === 'DATA_ANOMALY')) {
    secondaryActions.push("Improve document capture quality or request original data sources.");
  }

  return {
    primary_recommendation: primaryRec,
    secondary_actions: secondaryActions,
    timeline: "Resolve critical items within 24-48 business hours.",
    communication: "Send customer explanation and status confirmation.",
    follow_up: "Monitor for reoccurrence and confirm system fixes."
  };
}

function generateExecutiveSummary(investigations: Investigation[], model: MasterUnifiedModel) {
  const highestSeverity = getHighestSeverity(investigations);
  const mainInvestigation = investigations[0]; // Take the most critical one if sorted

  return {
    finding: mainInvestigation 
      ? `Detected ${investigations.length} anomalies, including a ${mainInvestigation.step_3_classification.subcategory}.`
      : "No significant anomalies detected in the provided dataset.",
    root_cause: mainInvestigation ? mainInvestigation.step_2_root_cause.primary_hypothesis : "Normal business activity",
    confidence: mainInvestigation ? `${mainInvestigation.step_6_confidence.overall_confidence_percentage}%` : "100%",
    recommended_action: mainInvestigation ? "Approve recommended resolution actions" : "No action needed",
    priority: highestSeverity,
    next_steps: mainInvestigation ? "Execute refunds and resolve system conflicts" : "Continue routine monitoring"
  };
}

function getHighestSeverity(investigations: Investigation[]): SeverityLevel {
  if (investigations.some(i => i.step_5_impact_assessment.overall_severity === 'CRITICAL')) return 'CRITICAL';
  if (investigations.some(i => i.step_5_impact_assessment.overall_severity === 'HIGH')) return 'HIGH';
  if (investigations.some(i => i.step_5_impact_assessment.overall_severity === 'MEDIUM')) return 'MEDIUM';
  if (investigations.some(i => i.step_5_impact_assessment.overall_severity === 'LOW')) return 'LOW';
  return 'INFORMATIONAL';
}
