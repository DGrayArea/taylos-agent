import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface DeleteReportRequest {
  id?: string;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as DeleteReportRequest;
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Report id required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.from("reports").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to delete report", details: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
