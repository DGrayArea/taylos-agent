export type DocumentSourceType =
  | "bank_statement"
  | "invoice"
  | "transaction_log"
  | "customer_complaint"
  | "account_history"
  | "unknown";

export interface UnifiedTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  direction: "debit" | "credit";
  merchant: string;
  source_document: string;
  source_line?: number;
  confidence: number;
}

export interface UnifiedInvoice {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  vendor: string;
  due_date: string; // YYYY-MM-DD
  status: "paid" | "unpaid" | "pending";
  source_document?: string;
}

export interface UnifiedComplaint {
  text: string;
  date_filed: string; // YYYY-MM-DD
  sentiment: string;
  mentions: string[];
  source_document?: string;
}

export interface DataQualityMetrics {
  analysis_date: string;
  data_quality_score: number;
  parsing_issues: string[];
  data_gaps: string[];
}

export interface MasterUnifiedModel {
  unified_data: {
    documents_processed: {
      bank_statements?: {
        count: number;
        date_range: string;
        transactions_extracted: number;
        total_inflow: number;
        total_outflow: number;
      };
      invoices?: {
        count: number;
        total_amount: number;
        vendors: string[];
      };
      customer_complaints?: {
        count: number;
        sentiment: string;
        key_issues: string[];
      };
    };
    transactions: UnifiedTransaction[];
    invoices: UnifiedInvoice[];
    complaints: UnifiedComplaint[];
    metadata: DataQualityMetrics;
    anomalies?: DetectionResult;
  };
}

// Interfaces for incoming raw data (Simulating OCR extraction)
export interface RawDocumentPayload {
  filename: string;
  content_type: string;
  raw_text: string;
  // Fallback for structured data files like CSV/JSON
  structured_data?: Array<Record<string, unknown>>;
}

export interface ReportHistoryRow {
  id: string;
  created_at: string;
  date: string;
  documents: number;
  issues: number;
  status: string;
  data: ComprehensiveAnalysis;
}

// -----------------------------------------------------------------------------
// FEATURE 2: ANOMALY DETECTION TYPES
// -----------------------------------------------------------------------------

export type SeverityLevel =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "INFORMATIONAL";

export interface Anomaly {
  id: string;
  type: string;
  category: "Structural" | "Pattern" | "Data";
  severity: SeverityLevel;
  anomaly_score: number; // 0-100
  confidence: number; // 0-100
  affected_transactions: string[];
  affected_amounts: number[];
  description: string;
  evidence_points: string[];
  first_occurrence?: string;
  related_documents: string[];
  // Extra AI-generated fields
  recommended_action?: string;
  financial_impact?: string;
  system_detected?: boolean;
  business_impact?: string;
}

export interface AnomalySummary {
  total_anomalies: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  total_affected_amount: number;
}

export interface DetectionResult {
  anomalies_detected: Anomaly[];
  anomaly_summary: AnomalySummary;
}

// -----------------------------------------------------------------------------
// FEATURE 3: INVESTIGATION TYPES
// -----------------------------------------------------------------------------

export interface EvidenceItem {
  finding: string;
  significance: string;
  source: string;
  confidence: "very_high" | "high" | "moderate" | "low";
}

export interface EvidenceChain {
  temporal_evidence: EvidenceItem[];
  merchant_evidence: EvidenceItem[];
  customer_evidence: EvidenceItem[];
  system_evidence: EvidenceItem[];
  contradicting_evidence: { finding: string; note: string }[];
  summary: string;
}

export interface Investigation {
  anomaly_id: string;
  step_1_what_happened: {
    summary: string;
  };
  step_2_root_cause: {
    diagnosis: string;
    primary_hypothesis: string;
    hypothesis_confidence: number;
    alternative_hypotheses: {
      hypothesis: string;
      likelihood: string;
      evidence_against: string;
    }[];
  };
  step_3_classification: {
    primary_category: string;
    subcategory: string;
    fraud_indicator: boolean;
    customer_error: boolean;
    system_error: boolean;
    legitimate_activity: boolean;
    requires_refund: boolean;
    refund_justification?: string;
  };
  step_4_evidence_chain: {
    total_evidence_points: number;
    supporting_evidence: string[]; // Plain text for simplified display
    detailed_chain: EvidenceChain;
    contradicting_evidence: string[];
    missing_information: string[];
  };
  step_5_impact_assessment: {
    financial_impact: string;
    customer_impact: string;
    operational_impact: string;
    regulatory_impact: string;
    overall_severity: SeverityLevel;
    impact_score: number; // 0-10
  };
  step_6_confidence: {
    overall_confidence_percentage: number;
    confidence_level: string;
    evidence_quality: string;
    data_completeness: string;
    alternative_explanations: string;
  };
}

export interface ComprehensiveAnalysis {
  analysis_metadata: {
    analysis_date: string;
    analysis_version: string;
    total_processing_time_seconds: number;
    data_quality_score: number;
    documents_processed: number;
    total_transactions_analyzed: number;
  };
  // Chart / visualisation data
  spending_by_category?: Record<string, number>;
  monthly_trend?: Array<{
    month: string;
    total_debits: number;
    total_credits: number;
    anomaly_count: number;
  }>;
  feature_1_data_intake: MasterUnifiedModel;
  feature_2_anomalies: {
    total_anomalies_found: number;
    anomalies_by_severity: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    anomaly_list: Anomaly[];
  };
  feature_3_investigations: {
    investigations: Investigation[];
  };
  recommendations: {
    primary_recommendation: string;
    secondary_actions: string[];
    timeline: string;
    communication: string;
    follow_up: string;
  };
  executive_summary: {
    finding: string;
    root_cause: string;
    confidence: string;
    recommended_action: string;
    priority: SeverityLevel;
    next_steps: string;
  };
  source_documents?: string[];
}
