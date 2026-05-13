export type AnomalySeverity = 'critical' | 'high' | 'medium' | 'low';
export type ClassificationType = 'FRAUD' | 'BILLING ERROR' | 'SYSTEM GLITCH' | 'USER ERROR' | 'LEGITIMATE ACTIVITY';

export interface Document {
  id: string;
  name: string;
  type: string;
  uploadTime: string;
  size: string;
  status: 'Complete' | 'Processing' | 'Error';
}

export interface Anomaly {
  id: string;
  type: string;
  severity: AnomalySeverity;
  amount: number | null;
  date: string;
  description: string;
  score: number;
  classification: ClassificationType;
  confidence: number;
  whatHappened: string;
  whyHappened: string;
  impact: {
    financial: string;
    customer: string;
    system: string;
    regulatory: string;
  };
  recommendedAction: string;
  evidence: Array<{
    id: string;
    label: string;
    detail: string;
  }>;
}

export const mockDocuments: Document[] = [
  { id: 'd1', name: 'Q3_Bank_Statement.pdf', type: 'PDF', uploadTime: '2 mins ago', size: '2.4 MB', status: 'Complete' },
  { id: 'd2', name: 'Vendor_Invoices_Oct.csv', type: 'CSV', uploadTime: '2 mins ago', size: '1.1 MB', status: 'Complete' },
  { id: 'd3', name: 'Customer_Complaints.json', type: 'JSON', uploadTime: '1 min ago', size: '450 KB', status: 'Complete' },
];

export const mockIntakeSummary = [
  { label: 'Bank Statements', value: '423', subtext: 'transactions extracted' },
  { label: 'Invoices', value: '87', subtext: 'invoices parsed' },
  { label: 'Complaints', value: '14', subtext: 'texts analyzed' },
  { label: 'Account History', value: '2,045', subtext: 'records loaded' },
];

export const mockAnomalies: Anomaly[] = [
  {
    id: 'a1',
    type: 'Duplicate Charge',
    severity: 'critical',
    amount: 500,
    date: '2023-10-15',
    description: 'Two identical charges within 45 minutes',
    score: 98,
    classification: 'BILLING ERROR',
    confidence: 98,
    whatHappened: 'Two $500 charges detected when only one invoice exists for Acme Corp.',
    whyHappened: 'Payment processor retry loop (45-minute gap) triggered a second authorization without a corresponding invoice.',
    impact: {
      financial: '-$500.00',
      customer: 'Account overcharged, dispute likely',
      system: 'Processor bug detected',
      regulatory: 'Standard compliance required'
    },
    recommendedAction: 'APPROVE REFUND',
    evidence: [
      { id: 'e1', label: 'Timestamp evidence', detail: 'Charge 1: 10:15 AM | Charge 2: 11:00 AM' },
      { id: 'e2', label: 'Merchant evidence', detail: 'Both charges to "Acme Corp"' },
      { id: 'e3', label: 'Cross-document', detail: 'Only one matching invoice #INV-402 found' }
    ]
  },
  {
    id: 'a2',
    type: 'Unusual Pattern',
    severity: 'high',
    amount: 12500,
    date: '2023-10-14',
    description: 'Transaction volume 300% above historical average',
    score: 85,
    classification: 'FRAUD',
    confidence: 89,
    whatHappened: 'A sudden spike of $12,500 transferred to a new offshore account.',
    whyHappened: 'Compromised user credentials allowed an unauthorized transfer to an unrecognized vendor.',
    impact: {
      financial: '-$12,500.00',
      customer: 'High risk of funds loss',
      system: 'Security breach',
      regulatory: 'Requires immediate fraud reporting'
    },
    recommendedAction: 'FREEZE ACCOUNT',
    evidence: [
      { id: 'e4', label: 'Pattern matching', detail: '300% above 90-day average' },
      { id: 'e5', label: 'Location evidence', detail: 'IP address originates from outside standard operating region' },
      { id: 'e6', label: 'Vendor check', detail: 'Vendor account created < 24 hours ago' }
    ]
  },
  {
    id: 'a3',
    type: 'Missing Receipt',
    severity: 'medium',
    amount: 120.50,
    date: '2023-10-12',
    description: 'Corporate card expense lacking documentation',
    score: 65,
    classification: 'USER ERROR',
    confidence: 95,
    whatHappened: 'Employee submitted a $120.50 expense without attaching the required receipt.',
    whyHappened: 'User bypassed the receipt upload step during the mobile submission flow.',
    impact: {
      financial: '$0.00 (Pending)',
      customer: 'Reimbursement delayed',
      system: 'None',
      regulatory: 'Tax compliance risk if approved'
    },
    recommendedAction: 'REQUEST DOCUMENTATION',
    evidence: [
      { id: 'e7', label: 'System logs', detail: 'Upload step skipped at 09:42 AM' },
      { id: 'e8', label: 'Policy check', detail: 'Requires receipt for > $50.00' }
    ]
  },
  {
    id: 'a4',
    type: 'System Sync Delay',
    severity: 'low',
    amount: null,
    date: '2023-10-16',
    description: 'Database sync delayed by 2 hours',
    score: 40,
    classification: 'SYSTEM GLITCH',
    confidence: 100,
    whatHappened: 'Nightly batch processing started 2 hours later than scheduled.',
    whyHappened: 'Routine maintenance on upstream database caused lock contention.',
    impact: {
      financial: 'None',
      customer: 'Reports delayed for morning shift',
      system: 'Queue backup (Resolved)',
      regulatory: 'None'
    },
    recommendedAction: 'ACKNOWLEDGE',
    evidence: [
      { id: 'e9', label: 'Server logs', detail: 'Maintenance window extended from 02:00 to 04:00' }
    ]
  }
];
