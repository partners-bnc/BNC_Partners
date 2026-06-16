// Public endpoint for the SendGrid Event Webhook.
// URL (after deploy): https://<project-ref>.supabase.co/functions/v1/sendgrid-events
//
// It verifies the SendGrid signature (if SENDGRID_WEBHOOK_PUBLIC_KEY is set), records each
// engagement event into crm_email_events, and maintains crm_suppressions. It does NOT advance
// the flow — the condition node reads accumulated events at evaluation time (campaign-tick).
//
// Required secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and (recommended)
// SENDGRID_WEBHOOK_PUBLIC_KEY for signed-webhook verification.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PUBLIC_KEY_B64 = Deno.env.get("SENDGRID_WEBHOOK_PUBLIC_KEY") ?? "";

const SIG_HEADER = "x-twilio-email-event-webhook-signature";
const TS_HEADER = "x-twilio-email-event-webhook-timestamp";

const SUPPRESS_REASONS: Record<string, string> = {
  bounce: "bounce",
  dropped: "dropped",
  spamreport: "spam",
  unsubscribe: "unsub",
  group_unsubscribe: "unsub",
};

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// SendGrid signs with ECDSA P-256/SHA-256 and sends an ASN.1 DER signature.
// WebCrypto needs the raw r||s (64-byte) form, so convert.
function derToRaw(der: Uint8Array): Uint8Array {
  let offset = 2; // skip 0x30 (sequence) + length
  if (der[offset] !== 0x02) throw new Error("bad DER");
  let rLen = der[offset + 1];
  let r = der.slice(offset + 2, offset + 2 + rLen);
  offset = offset + 2 + rLen;
  if (der[offset] !== 0x02) throw new Error("bad DER");
  let sLen = der[offset + 1];
  let s = der.slice(offset + 2, offset + 2 + sLen);
  const trim = (b: Uint8Array) => (b.length > 32 ? b.slice(b.length - 32) : b);
  const pad = (b: Uint8Array) => {
    const out = new Uint8Array(32);
    out.set(trim(b), 32 - trim(b).length);
    return out;
  };
  const raw = new Uint8Array(64);
  raw.set(pad(r), 0);
  raw.set(pad(s), 32);
  return raw;
}

async function verifySignature(rawBody: string, signature: string, timestamp: string): Promise<boolean> {
  if (!PUBLIC_KEY_B64) return true; // verification disabled until key is provided
  try {
    const key = await crypto.subtle.importKey(
      "spki",
      b64ToBytes(PUBLIC_KEY_B64),
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["verify"],
    );
    const data = new TextEncoder().encode(timestamp + rawBody);
    const sig = derToRaw(b64ToBytes(signature));
    return await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, key, sig, data);
  } catch (_err) {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get(SIG_HEADER) ?? "";
  const timestamp = req.headers.get(TS_HEADER) ?? "";

  if (PUBLIC_KEY_B64 && !(await verifySignature(rawBody, signature, timestamp))) {
    return new Response("Invalid signature", { status: 403 });
  }

  let events: any[];
  try {
    events = JSON.parse(rawBody);
    if (!Array.isArray(events)) throw new Error("expected array");
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  const eventRows: any[] = [];
  const suppressions: any[] = [];

  for (const e of events) {
    // SendGrid echoes custom_args at the top level of each event.
    const sgMessageId = String(e.sg_message_id ?? "").split(".")[0] || null;
    const occurredAt = e.timestamp ? new Date(e.timestamp * 1000).toISOString() : new Date(0).toISOString();

    eventRows.push({
      send_id: e.send_id ?? null,
      enrollment_id: e.enrollment_id ?? null,
      sg_message_id: sgMessageId,
      event_type: String(e.event ?? "unknown"),
      url: e.url ?? null,
      occurred_at: occurredAt,
      raw: e,
    });

    const reason = SUPPRESS_REASONS[String(e.event ?? "")];
    if (reason && e.email) {
      suppressions.push({ email: String(e.email), lead_id: e.lead_id ?? null, reason });
    }
  }

  if (eventRows.length) {
    // onConflict matches the unique index (sg_message_id, event_type, occurred_at) — dedupes retries.
    await supabase.from("crm_email_events").upsert(eventRows, {
      onConflict: "sg_message_id,event_type,occurred_at",
      ignoreDuplicates: true,
    });
  }
  if (suppressions.length) {
    await supabase.from("crm_suppressions").upsert(suppressions, { onConflict: "email", ignoreDuplicates: true });
  }

  return new Response(JSON.stringify({ received: eventRows.length }), {
    headers: { "content-type": "application/json" },
  });
});
