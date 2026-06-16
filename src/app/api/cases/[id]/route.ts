// src/app/api/cases/[id]/route.ts
// Feature 10: Case Management — get, update, delete single case
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logAction } from "@/lib/audit";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.from("cases").select("*").eq("id", id).maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Case not found." }, { status: 404 });

  return NextResponse.json({ case: data });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  // Allowed update fields
  const allowed = ["status", "assignee", "deadline", "title", "description", "severity", "resolution_note"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  // Handle comment addition
  if (body.comment && typeof body.comment === "string") {
    const { data: existing } = await supabase.from("cases").select("comments").eq("id", id).single();
    const existingComments = (existing?.comments as Array<{ text: string; created_at: string }>) ?? [];
    updates.comments = [
      ...existingComments,
      { text: body.comment, created_at: new Date().toISOString(), author: body.author ?? "Anonymous" },
    ];
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase.from("cases").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const action = body.status === "resolved" ? "case.resolve" : body.comment ? "case.comment" : "case.update";
  await logAction(action as Parameters<typeof logAction>[0], {
    resourceType: "case",
    resourceId: id,
    metadata: updates,
  });

  return NextResponse.json({ case: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { error } = await supabase.from("cases").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
