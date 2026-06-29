import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check if organisations table exists
  const { data: orgs, error: orgsError } = await supabase
    .from("organisations")
    .select("*")
    .limit(1);

  // Check if user_roles table exists
  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select("*")
    .limit(1);

  return NextResponse.json({
    organisations: { data: orgs, error: orgsError },
    userRoles: { data: roles, error: rolesError },
  });
}
