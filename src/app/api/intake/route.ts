import { NextResponse } from "next/server";
import { runPlatformAnalysis } from "@/lib/analysis";
import { RawDocumentPayload } from "@/lib/types";

type IntakeBody = RawDocumentPayload | RawDocumentPayload[];

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as IntakeBody;

    // Expecting an array of RawDocumentPayload
    const payloads: RawDocumentPayload[] = Array.isArray(body) ? body : [body];

    if (!payloads || payloads.length === 0) {
      return NextResponse.json(
        { error: "No document payloads provided." },
        { status: 400 },
      );
    }

    // Process the data through the Platform Analysis engine
    const analysis = await runPlatformAnalysis(payloads);
    const unifiedModel = analysis.feature_1_data_intake;

    return NextResponse.json(unifiedModel);
  } catch (error: unknown) {
    console.error("Error in Data Intake Agent:", error);
    return NextResponse.json(
      {
        error: "Failed to process financial data.",
        details: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}
