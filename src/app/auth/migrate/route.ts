import { NextResponse } from "next/server";

export async function GET() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
    }
  });
  const schema = await response.json();
  
  // List all RPC names
  const paths = Object.keys(schema.paths || {});
  const rpcs = paths.filter(p => p.startsWith('/rpc/'));

  return NextResponse.json({ rpcs, paths });
}
