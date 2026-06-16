// campaign-tick — the Lead Re-engagement execution engine.
//
// Invoked every minute by pg_cron (via pg_net.http_post). Pulls due rows from
// crm_scheduled_jobs and advances each enrollment ONE node: sends email via SendGrid,
// schedules waits, and branches on the SendGrid events that sendgrid-events recorded.
//
// Auth: this function is NOT JWT-protected (cron can't mint a Supabase JWT). It is gated
// by a shared secret in the `x-tick-secret` header, compared against CAMPAIGN_TICK_SECRET.
// Deploy with: supabase functions deploy campaign-tick --no-verify-jwt
//
// Required secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SENDGRID_API_KEY,
//   SENDGRID_FROM_EMAIL, SENDGRID_FROM_NAME, CAMPAIGN_TICK_SECRET, OPENAI_API_KEY (for aiEmail).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TICK_SECRET = Deno.env.get("CAMPAIGN_TICK_SECRET") ?? "";
const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY") ?? "";
const FROM_EMAIL = Deno.env.get("SENDGRID_FROM_EMAIL") ?? "partners@bncglobal.in";
const FROM_NAME = Deno.env.get("SENDGRID_FROM_NAME") ?? "BNC CRM";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
const OPENAI_MODEL = Deno.env.get("OPENAI_ANSWER_MODEL") ?? "gpt-4.1-mini";

const MAX_JOBS_PER_TICK = 25;
const MAX_ATTEMPTS = 3;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

// ---- template helpers (mirrors src/crm/emailTemplates.js; the engine can't import browser code) ----

function renderVars(content: string, vars: Record<string, string>): string {
  return String(content || "").replace(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g, (m, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : m,
  );
}

function sanitizeHtml(html: string): string {
  let s = String(html || "");
  s = s.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
  s = s.replace(/<style[\s\S]*?@import[\s\S]*?<\/style>/gi, "");
  s = s.replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "");
  s = s.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  s = s.replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, "");
  return s.trim();
}

// Map a crm_leads row + published defaults into the {{Variables}} a template expects.
function leadVariables(lead: any, defaults: Record<string, string>): Record<string, string> {
  const firstName = String(lead?.full_name || "").trim().split(/\s+/)[0] || "there";
  return {
    ...defaults,
    ContactName: lead?.full_name || firstName,
    FirstName: firstName,
    City: lead?.city || "",
    Country: lead?.country || "",
    LeadSource: lead?.lead_source || "",
    LeadCategory: lead?.lead_category || "",
    AgentName: defaults.AgentName || FROM_NAME,
  };
}

// ---- SendGrid send ----

async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  customArgs: Record<string, string>;
}): Promise<{ ok: boolean; messageId: string | null; error?: string }> {
  const payload = {
    personalizations: [{ to: [{ email: opts.to }], custom_args: opts.customArgs }],
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: opts.subject,
    content: [
      { type: "text/plain", value: opts.text || " " },
      { type: "text/html", value: opts.html || " " },
    ],
    tracking_settings: {
      click_tracking: { enable: true, enable_text: false },
      open_tracking: { enable: true },
    },
  };
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (res.status === 202) {
    return { ok: true, messageId: res.headers.get("x-message-id") };
  }
  const body = await res.text();
  return { ok: false, messageId: null, error: `HTTP ${res.status}: ${body.slice(0, 300)}` };
}

// ---- OpenAI rewrite for aiEmail nodes ----

async function aiRewriteHtml(baseHtml: string, tone: string, prompt: string, vars: Record<string, string>): Promise<string> {
  if (!OPENAI_API_KEY) return baseHtml;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "You rewrite marketing email HTML. Keep it valid inline-styled HTML suitable for email clients. " +
              "Preserve any {{Variable}} placeholders verbatim. Return ONLY the HTML body, no markdown fences, no commentary.",
          },
          {
            role: "user",
            content:
              `Tone: ${tone || "Professional"}\nInstruction: ${prompt || "Personalize this follow-up."}\n` +
              `Known recipient facts: ${JSON.stringify(vars)}\n\nBase HTML to rewrite:\n${baseHtml}`,
          },
        ],
      }),
    });
    if (!res.ok) return baseHtml;
    const data = await res.json();
    const out = data?.choices?.[0]?.message?.content;
    return typeof out === "string" && out.trim() ? sanitizeHtml(out) : baseHtml;
  } catch {
    return baseHtml;
  }
}

// ---- flow graph helpers ----

function nodeById(flow: any, id: string) {
  return (flow?.nodes || []).find((n: any) => n.id === id) || null;
}
function outgoingEdges(flow: any, id: string) {
  return (flow?.edges || []).filter((e: any) => e.source === id);
}

const WAIT_MS: Record<string, number> = {
  minutes: 60_000,
  hours: 3_600_000,
  days: 86_400_000,
};

// Decide which condition branch handle to follow, from events seen for the latest send.
function pickConditionEdge(edges: any[], eventTypes: Set<string>) {
  const candidatesByPriority: string[][] = [];
  if (eventTypes.has("spamreport")) candidatesByPriority.push(["Marked spam"]);
  if (eventTypes.has("click")) candidatesByPriority.push(["Clicked link", "Replied"]);
  if (eventTypes.has("open")) candidatesByPriority.push(["Opened, no click", "Replied"]);
  candidatesByPriority.push(["No reply"]);

  for (const candidates of candidatesByPriority) {
    const hit = edges.find((e) => candidates.includes(String(e.sourceHandle ?? e.label ?? "")));
    if (hit) return hit;
  }
  return edges[0] || null;
}

// ---- core: advance one enrollment by executing `job.node_id` ----

async function executeJob(job: any): Promise<void> {
  const { data: enrollment } = await supabase
    .from("crm_enrollments")
    .select("*")
    .eq("id", job.enrollment_id)
    .maybeSingle();
  if (!enrollment || enrollment.status === "completed" || enrollment.status === "suppressed") {
    return; // enrollment gone or terminal — drop the job silently
  }

  const { data: flowRow } = await supabase
    .from("crm_campaign_flows")
    .select("flow")
    .eq("id", enrollment.campaign_id)
    .maybeSingle();
  const flow = flowRow?.flow;
  const node = nodeById(flow, job.node_id);
  if (!flow || !node) throw new Error(`node ${job.node_id} not in published flow ${enrollment.campaign_id}`);

  const defaults = (flow.defaults && typeof flow.defaults === "object" ? flow.defaults : {}) as Record<string, string>;
  const ctx = (enrollment.context && typeof enrollment.context === "object" ? enrollment.context : {}) as any;

  // Resolve the next node + delay after executing this one.
  let nextNodeId: string | null = null;
  let delayMs = 0;
  const edges = outgoingEdges(flow, node.id);

  const kind = node.type || node.data?.kind;

  if (kind === "email" || kind === "aiEmail") {
    const { data: lead } = await supabase.from("crm_leads").select("*").eq("id", enrollment.lead_id).maybeSingle();
    if (!lead?.email) throw new Error(`lead ${enrollment.lead_id} has no email`);

    // Honor suppressions — never email a bounced/unsubscribed/spam-flagged address.
    const { data: suppressed } = await supabase
      .from("crm_suppressions")
      .select("email")
      .eq("email", String(lead.email).toLowerCase())
      .maybeSingle();

    if (!suppressed) {
      const vars = leadVariables(lead, defaults);
      const t = node.data || {};
      let html = sanitizeHtml(t.html_body || "");
      if (kind === "aiEmail") {
        html = await aiRewriteHtml(html, t.aiTone || "Professional", t.aiPrompt || "", vars);
      }
      const subject = renderVars(t.subject || "", vars);
      const renderedHtml = renderVars(html, vars);
      const text = renderVars(t.plain_text_body || "", vars);

      // Insert the send row first so its id can ride along as a custom_arg for correlation.
      const { data: sendRow, error: sendErr } = await supabase
        .from("crm_email_sends")
        .insert({
          enrollment_id: enrollment.id,
          node_id: node.id,
          lead_id: enrollment.lead_id,
          subject,
        })
        .select("id")
        .single();
      if (sendErr) throw new Error(`could not record send: ${sendErr.message}`);

      const result = await sendEmail({
        to: String(lead.email),
        subject,
        html: renderedHtml,
        text,
        customArgs: {
          enrollment_id: enrollment.id,
          node_id: node.id,
          send_id: sendRow.id,
          lead_id: String(enrollment.lead_id),
        },
      });
      if (!result.ok) throw new Error(result.error || "SendGrid send failed");

      if (result.messageId) {
        await supabase.from("crm_email_sends").update({ sg_message_id: result.messageId }).eq("id", sendRow.id);
      }
      ctx.last_send_id = sendRow.id;
    }
    nextNodeId = edges[0]?.target ?? null;
  } else if (kind === "wait") {
    const value = Number(node.data?.waitValue ?? 1);
    const unit = String(node.data?.waitUnit ?? "days");
    delayMs = value * (WAIT_MS[unit] ?? WAIT_MS.days);
    nextNodeId = edges[0]?.target ?? null;
  } else if (kind === "condition") {
    // Read events recorded for this enrollment's most recent send.
    const sendId = ctx.last_send_id;
    const eventTypes = new Set<string>();
    if (sendId) {
      const { data: events } = await supabase
        .from("crm_email_events")
        .select("event_type")
        .eq("send_id", sendId);
      for (const e of events || []) eventTypes.add(String(e.event_type));
    }
    const chosen = pickConditionEdge(edges, eventTypes);
    nextNodeId = chosen?.target ?? null;
    ctx.last_branch = chosen ? String(chosen.sourceHandle ?? chosen.label ?? "") : "none";
  } else if (kind === "action") {
    const actionType = String(node.data?.actionType || "");
    if (actionType === "Schedule reminder") {
      delayMs = 2 * WAIT_MS.days; // node label: "Wait 2 days, then send reminder"
    } else {
      // Notify rep — record an internal notification for the CRM inbox.
      await supabase.from("crm_notifications").insert({
        enrollment_id: enrollment.id,
        lead_id: enrollment.lead_id,
        kind: actionType || "Notify rep",
        message: node.data?.label || actionType,
      });
    }
    nextNodeId = edges[0]?.target ?? null;
  } else if (kind === "end") {
    const outcome = String(node.data?.outcome || "completed");
    const status = ["engaged", "cold", "suppressed"].includes(outcome) ? outcome : "completed";
    await supabase
      .from("crm_enrollments")
      .update({ status, current_node_id: node.id, context: ctx, updated_at: new Date().toISOString() })
      .eq("id", enrollment.id);
    return; // terminal — no next job
  } else {
    // trigger (or unknown) — just move on.
    nextNodeId = edges[0]?.target ?? null;
  }

  // Persist enrollment position + context, then enqueue the next node.
  await supabase
    .from("crm_enrollments")
    .update({
      current_node_id: nextNodeId ?? node.id,
      context: ctx,
      updated_at: new Date().toISOString(),
    })
    .eq("id", enrollment.id);

  if (nextNodeId) {
    await supabase.from("crm_scheduled_jobs").insert({
      enrollment_id: enrollment.id,
      node_id: nextNodeId,
      run_at: new Date(Date.now() + delayMs).toISOString(),
      status: "pending",
    });
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!TICK_SECRET || req.headers.get("x-tick-secret") !== TICK_SECRET) {
    return new Response("Forbidden", { status: 403 });
  }

  const nowIso = new Date().toISOString();
  const { data: jobs, error } = await supabase
    .from("crm_scheduled_jobs")
    .select("*")
    .eq("status", "pending")
    .lte("run_at", nowIso)
    .order("run_at", { ascending: true })
    .limit(MAX_JOBS_PER_TICK);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  let processed = 0;
  let failed = 0;

  for (const job of jobs || []) {
    // Claim the job so concurrent ticks don't double-process it.
    const { data: claimed } = await supabase
      .from("crm_scheduled_jobs")
      .update({ status: "processing", attempts: (job.attempts ?? 0) + 1 })
      .eq("id", job.id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();
    if (!claimed) continue;

    try {
      await executeJob(job);
      await supabase.from("crm_scheduled_jobs").update({ status: "done" }).eq("id", job.id);
      processed++;
    } catch (err) {
      failed++;
      const attempts = (job.attempts ?? 0) + 1;
      const msg = err instanceof Error ? err.message : String(err);
      await supabase
        .from("crm_scheduled_jobs")
        .update({
          status: attempts >= MAX_ATTEMPTS ? "failed" : "pending",
          last_error: msg,
        })
        .eq("id", job.id);
    }
  }

  return new Response(JSON.stringify({ processed, failed, scanned: (jobs || []).length }), {
    headers: { "content-type": "application/json" },
  });
});
