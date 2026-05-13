// src/app/api/upload/route.ts
// PURPOSE: Receives file uploads, extracts text/data, and returns structured payloads.
// This is the ENTRY POINT for all document uploads.
//
// PIPELINE:
//   Client sends multipart/form-data with files
//   ↓ This route extracts each file into a RawDocumentPayload
//   ↓ Returns the payloads (client then calls /api/analyze)

import { NextResponse } from "next/server";
import { parseCSV, detectDocumentType } from "@/lib/parser";
import { RawDocumentPayload } from "@/lib/types";
import { extractTextFromPDF } from "@/lib/parser";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files uploaded." },
        { status: 400 },
      );
    }

    const payloads: RawDocumentPayload[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const docType = detectDocumentType(file.name);
      const mimeType = file.type;

      let structured_data: any[] | undefined;
      let raw_text = "";

      if (mimeType === "text/csv" || file.name.endsWith(".csv")) {
        // CSV: parse into structured rows
        structured_data = parseCSV(buffer);
        raw_text = buffer.toString("utf-8");
      } else if (
        mimeType === "application/json" ||
        file.name.endsWith(".json")
      ) {
        // JSON: parse directly
        const parsed = JSON.parse(buffer.toString("utf-8"));
        structured_data = Array.isArray(parsed) ? parsed : [parsed];
        raw_text = buffer.toString("utf-8");
      } else if (mimeType === "application/pdf" || file.name.endsWith(".pdf")) {
        // PDF extraction
        raw_text = await extractTextFromPDF(buffer);
      } else {
        // Plain text fallback
        raw_text = buffer.toString("utf-8");
      }

      payloads.push({
        filename: file.name,
        content_type: docType,
        raw_text,
        structured_data,
      });
    }

    return NextResponse.json({ payloads }, { status: 200 });
  } catch (error: any) {
    console.error("[/api/upload] Error:", error);
    return NextResponse.json(
      { error: "File processing failed.", details: error.message },
      { status: 500 },
    );
  }
}
