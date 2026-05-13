import { NextResponse } from 'next/server';
import { processFinancialData } from '@/lib/agent/dataIntake';
import { RawDocumentPayload } from '@/lib/agent/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Expecting an array of RawDocumentPayload
    const payloads: RawDocumentPayload[] = Array.isArray(body) ? body : [body];

    if (!payloads || payloads.length === 0) {
      return NextResponse.json(
        { error: 'No document payloads provided.' },
        { status: 400 }
      );
    }

    // Process the data through the agentic intake engine
    const unifiedModel = processFinancialData(payloads);

    return NextResponse.json(unifiedModel);
  } catch (error: any) {
    console.error('Error in Data Intake Agent:', error);
    return NextResponse.json(
      { error: 'Failed to process financial data.', details: error.message },
      { status: 500 }
    );
  }
}
