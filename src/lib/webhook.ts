// src/lib/webhook.ts
// Feature 3: Webhook delivery with HMAC-SHA256 signing + exponential backoff retry
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export interface WebhookEndpoint {
  id: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
}

function signPayload(payload: string, secret: string): string {
  return "sha256=" + crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

async function deliverOnce(url: string, payload: string, signature: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Taylos-Signature": signature,
        "X-Taylos-Timestamp": Date.now().toString(),
      },
      body: payload,
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deliverWebhook(
  endpoint: WebhookEndpoint,
  event: string,
  data: unknown,
): Promise<void> {
  const payload = JSON.stringify({ event, data, timestamp: new Date().toISOString() });
  const signature = signPayload(payload, endpoint.secret);

  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000)); // 2s, 4s
    }
    const ok = await deliverOnce(endpoint.url, payload, signature);
    if (ok) {
      await supabaseAdmin.from("webhook_deliveries").insert({
        endpoint_id: endpoint.id,
        event,
        status: "delivered",
        attempts: attempt + 1,
      });
      return;
    }
  }

  // All retries exhausted
  await supabaseAdmin.from("webhook_deliveries").insert({
    endpoint_id: endpoint.id,
    event,
    status: "failed",
    attempts: maxRetries,
  });
}

/** Fire all active webhooks for a given event type */
export async function fireWebhooks(event: string, data: unknown): Promise<void> {
  const { data: endpoints } = await supabaseAdmin
    .from("webhook_endpoints")
    .select("*")
    .eq("active", true)
    .contains("events", [event]);

  if (!endpoints || endpoints.length === 0) return;

  await Promise.allSettled(
    (endpoints as WebhookEndpoint[]).map((ep) => deliverWebhook(ep, event, data)),
  );
}
