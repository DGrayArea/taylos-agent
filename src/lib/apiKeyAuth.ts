// src/lib/apiKeyAuth.ts
// Feature 1: REST API — API Key validation + per-minute rate limiting
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export interface ApiKeyRecord {
  id: string;
  key_hash: string;
  org_name: string;
  rate_limit: number;        // requests per minute (e.g. 5)
  requests_this_hour: number; // reused column — now counts per-minute window
  last_reset_at: string;
  active: boolean;
}

function hashKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

export type AuthResult =
  | { ok: true; record: ApiKeyRecord }
  | { ok: false; status: number; error: string };

export async function validateApiKey(rawKey: string | null): Promise<AuthResult> {
  if (!rawKey) {
    return { ok: false, status: 401, error: "Missing X-API-Key header." };
  }

  const hash = hashKey(rawKey);

  const { data, error } = await supabaseAdmin
    .from("api_keys")
    .select("*")
    .eq("key_hash", hash)
    .eq("active", true)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, status: 401, error: "Invalid or revoked API key." };
  }

  const record = data as ApiKeyRecord;

  // Reset per-minute counter if the window has elapsed (60 seconds)
  const lastReset = new Date(record.last_reset_at).getTime();
  const now = Date.now();
  if (now - lastReset > 60_000) {
    await supabaseAdmin
      .from("api_keys")
      .update({ requests_this_hour: 0, last_reset_at: new Date().toISOString() })
      .eq("id", record.id);
    record.requests_this_hour = 0;
  }

  if (record.requests_this_hour >= record.rate_limit) {
    return {
      ok: false,
      status: 429,
      error: `Rate limit exceeded — ${record.rate_limit} requests per minute. Try again shortly.`,
    };
  }

  // Increment counter
  await supabaseAdmin
    .from("api_keys")
    .update({ requests_this_hour: record.requests_this_hour + 1 })
    .eq("id", record.id);

  return { ok: true, record };
}

/** Generate a secure random API key (call from admin UI) */
export function generateApiKey(): { raw: string; hash: string } {
  const raw = "tk_" + crypto.randomBytes(32).toString("hex");
  return { raw, hash: hashKey(raw) };
}
