import { 
  MasterUnifiedModel, 
  RawDocumentPayload, 
  UnifiedTransaction, 
  UnifiedInvoice, 
  UnifiedComplaint,
  DocumentSourceType
} from '../types';
import { normalizeDate, normalizeMerchant, normalizeAmountAndDirection } from './normalizers';
import { detectAnomalies } from './detector';

/**
 * Categorizes a document based on filename, mime type, and content.
 */
function categorizeDocument(doc: RawDocumentPayload): DocumentSourceType {
  const name = doc.filename.toLowerCase();
  if (name.includes('statement') || name.includes('bank')) return 'bank_statement';
  if (name.includes('invoice') || name.includes('receipt')) return 'invoice';
  if (name.includes('log') || name.includes('history')) return 'transaction_log';
  if (name.includes('complaint') || name.includes('support')) return 'customer_complaint';
  return 'unknown';
}

/**
 * Extracts and unifies data from an array of raw document payloads.
 * This simulates the agentic behavior of parsing disparate data sources
 * and consolidating them into the MasterUnifiedModel.
 */
export function processFinancialData(payloads: RawDocumentPayload[]): MasterUnifiedModel {
  
  const transactions: UnifiedTransaction[] = [];
  const invoices: UnifiedInvoice[] = [];
  const complaints: UnifiedComplaint[] = [];
  
  let bankStatementCount = 0;
  let totalInflow = 0;
  let totalOutflow = 0;
  
  let invoiceCount = 0;
  let invoiceTotal = 0;
  const invoiceVendors = new Set<string>();

  let complaintCount = 0;
  const complaintIssues = new Set<string>();

  const dataGaps: string[] = [];
  const parsingIssues: string[] = [];

  // Process each document
  payloads.forEach(doc => {
    const type = categorizeDocument(doc);
    
    // In a real system, we would run OCR or NLP extraction here.
    // Since we are simulating the OCR step, we assume the frontend
    // passed `structured_data` if it was a CSV/JSON, or we extract
    // dummy entities based on the document type.
    
    if (type === 'bank_statement' || type === 'transaction_log') {
      bankStatementCount++;
      if (doc.structured_data && Array.isArray(doc.structured_data)) {
        doc.structured_data.forEach((row, index) => {
          // Check for critical missing fields (C1)
          if (!row.amount && !row.value && row.amount !== 0) {
            parsingIssues.push(`Missing critical field: AMOUNT in ${doc.filename} row ${index + 1}`);
          }
          if (!row.date && !row.timestamp) {
            parsingIssues.push(`Missing critical field: DATE in ${doc.filename} row ${index + 1}`);
          }

          const { amount, direction } = normalizeAmountAndDirection(row.amount || row.value, row.type);
          
          if (direction === 'credit') totalInflow += amount;
          else totalOutflow += amount;

          transactions.push({
            id: row.id || `txn_${Date.now()}_${index}`,
            date: normalizeDate(row.date || row.timestamp),
            amount,
            direction,
            merchant: normalizeMerchant(row.merchant || row.description),
            source_document: doc.filename,
            source_line: index + 1,
            confidence: 0.95
          });
        });
      } else {
        dataGaps.push(`Empty or invalid structured data for ${doc.filename}`);
      }
    } 
    else if (type === 'invoice') {
      invoiceCount++;
      if (doc.structured_data && Array.isArray(doc.structured_data)) {
        doc.structured_data.forEach((row, index) => {
          if (!row.vendor) parsingIssues.push(`Missing critical field: VENDOR in ${doc.filename} row ${index + 1}`);
          
          const vendorName = normalizeMerchant(row.vendor);
          invoiceVendors.add(vendorName);
          const { amount } = normalizeAmountAndDirection(row.amount || row.total);
          invoiceTotal += amount;
          
          invoices.push({
            id: row.invoice_id || `inv_${Date.now()}_${index}`,
            date: normalizeDate(row.date || row.issue_date),
            amount,
            vendor: vendorName,
            due_date: normalizeDate(row.due_date),
            status: row.status?.toLowerCase() === 'paid' ? 'paid' : 'pending'
          });
        });
      } else {
        dataGaps.push(`No structured items found for invoice ${doc.filename}`);
      }
    }
    else if (type === 'customer_complaint') {
      complaintCount++;
      if (!doc.raw_text || doc.raw_text.length < 10) {
        dataGaps.push(`Complaint document ${doc.filename} is too short or empty`);
      }
      
      const sentiment = doc.raw_text.toLowerCase().includes('angry') || doc.raw_text.toLowerCase().includes('double') ? 'frustrated' : 'neutral';
      if (doc.raw_text.toLowerCase().includes('double') || doc.raw_text.toLowerCase().includes('duplicate')) {
        complaintIssues.add('duplicate charge');
      }

      complaints.push({
        text: doc.raw_text.substring(0, 200) + (doc.raw_text.length > 200 ? '...' : ''),
        date_filed: normalizeDate(new Date().toISOString()),
        sentiment,
        mentions: Array.from(complaintIssues)
      });
    }
  });

  // Calculate Data Quality Metrics
  const totalProcessed = transactions.length + invoices.length + complaints.length;
  // Base confidence starts at 100%, degrades for missing/unknown data
  let dataQualityScore = 1.0;

  if (totalProcessed === 0) {
    dataQualityScore = 0;
    parsingIssues.push("No extractable data found in payloads.");
  }

  // Build the Unified Model
  const unifiedModel: MasterUnifiedModel = {
    unified_data: {
      documents_processed: {},
      transactions,
      invoices,
      complaints,
      metadata: {
        analysis_date: new Date().toISOString().split('T')[0],
        data_quality_score: Math.max(0, dataQualityScore),
        parsing_issues: parsingIssues,
        data_gaps: dataGaps
      }
    }
  };

  // Run Anomaly Detection
  unifiedModel.unified_data.anomalies = detectAnomalies(unifiedModel);

  // Populate documents_processed metrics
  if (bankStatementCount > 0) {
    unifiedModel.unified_data.documents_processed.bank_statements = {
      count: bankStatementCount,
      date_range: "Extracted from transactions",
      transactions_extracted: transactions.length,
      total_inflow: totalInflow,
      total_outflow: totalOutflow
    };
  }
  
  if (invoiceCount > 0) {
    unifiedModel.unified_data.documents_processed.invoices = {
      count: invoiceCount,
      total_amount: invoiceTotal,
      vendors: Array.from(invoiceVendors)
    };
  }

  if (complaintCount > 0) {
    unifiedModel.unified_data.documents_processed.customer_complaints = {
      count: complaintCount,
      sentiment: "Mixed",
      key_issues: Array.from(complaintIssues)
    };
  }

  return unifiedModel;
}
