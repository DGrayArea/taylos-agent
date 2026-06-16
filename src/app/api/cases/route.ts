// src/app/api/cases/route.ts
// Feature 10: Case Management — list + create cases
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logAction } from "@/lib/audit";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const assignee = searchParams.get("assignee");

  let query = supabase
    .from("cases")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (status) query = query.eq("status", status);
  if (assignee) query = query.eq("assignee", assignee);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ cases: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { anomaly_id, report_id, title, description, severity, assignee, deadline } = body as {
    anomaly_id?: string;
    report_id?: string;
    title?: string;
    description?: string;
    severity?: string;
    assignee?: string;
    deadline?: string;
  };

  if (!anomaly_id || !title) {
    return NextResponse.json({ error: "anomaly_id and title are required." }, { status: 400 });
  }

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("cases")
    .insert({
      anomaly_id,
      report_id: report_id ?? null,
      title,
      description: description ?? "",
      severity: severity ?? "MEDIUM",
      status: "open",
      assignee: assignee ?? null,
      deadline: deadline ?? null,
      comments: [],
      user_id: user?.id ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAction("case.create", {
    resourceType: "case",
    resourceId: data.id,
    metadata: { anomaly_id, severity, assignee },
  });

  return NextResponse.json({ case: data }, { status: 201 });
}
