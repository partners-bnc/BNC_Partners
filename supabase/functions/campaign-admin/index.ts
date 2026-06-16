// campaign-admin — admin-only control plane for the campaign engine.
//
// Actions (POST { action, ... }):
//   • publish:       snapshot a flow (with embedded template content) into crm_campaign_flows.
//   • enroll:        enroll one or more crm_leads into a published campaign (creates the first job).
//   • lead_activity: read-only per-lead stats + enrollment status + event timeline for the CRM drawer.
//
// Auth: JWT-protected. The caller's Supabase session JWT is verified, then we confirm the
// user has a row in admin_profiles before doing any service-role write.
// Deploy normally (JWT verification ON): supabase functions deploy campaign-admin
//
// Required secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injected by Supabase).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...cors },
  });
}

async function requireAdmin(req: Request): Promise<{ userId: string } | Response> {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) return json({ error: "Missing Authorization header." }, 401);

  // Extract the JWT from "Bearer <token>"
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  // Use the admin client to verify the JWT — getUser() with the token validates it server-side.
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) {
    return json({ error: "Invalid or expired session.", detail: error?.message }, 401);
  }

  const { data: adminRow } = await admin
    .from("admin_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (!adminRow) return json({ error: "Admin access required." }, 403);

  return { userId: user.id };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const gate = await requireAdmin(req);
  if (gate instanceof Response) return gate;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Bad JSON." }, 400);
  }

  const action = String(body?.action || "");

  if (action === "publish") {
    const campaign = body?.campaign;
    if (!campaign?.id || !campaign?.flow?.nodes) {
      return json({ error: "campaign.id and campaign.flow are required." }, 400);
    }
    const { error } = await admin.from("crm_campaign_flows").upsert(
      {
        id: String(campaign.id),
        name: String(campaign.name || campaign.id),
        status: String(campaign.status || "Active"),
        flow: campaign.flow,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, published: campaign.id });
  }

  if (action === "enroll") {
    const campaignId = String(body?.campaign_id || "");
    const leadIds: string[] = Array.isArray(body?.lead_ids) ? body.lead_ids.map(String) : [];
    if (!campaignId || leadIds.length === 0) {
      return json({ error: "campaign_id and lead_ids[] are required." }, 400);
    }

    const { data: flowRow } = await admin
      .from("crm_campaign_flows")
      .select("flow")
      .eq("id", campaignId)
      .maybeSingle();
    if (!flowRow?.flow) return json({ error: "Campaign is not published yet." }, 400);

    const triggerNode = (flowRow.flow.nodes || []).find(
      (n: any) => (n.type || n.data?.kind) === "trigger",
    );
    if (!triggerNode) return json({ error: "Flow has no trigger node." }, 400);

    let enrolled = 0;
    const skipped: string[] = [];
    for (const leadId of leadIds) {
      // Don't double-enroll a lead that is still active in this campaign.
      const { data: existing } = await admin
        .from("crm_enrollments")
        .select("id")
        .eq("campaign_id", campaignId)
        .eq("lead_id", leadId)
        .in("status", ["active", "engaged", "cold"])
        .maybeSingle();
      if (existing) {
        skipped.push(leadId);
        continue;
      }

      const { data: enrollment, error: enrErr } = await admin
        .from("crm_enrollments")
        .insert({
          campaign_id: campaignId,
          lead_id: leadId,
          current_node_id: triggerNode.id,
          status: "active",
        })
        .select("id")
        .single();
      if (enrErr) continue;

      await admin.from("crm_scheduled_jobs").insert({
        enrollment_id: enrollment.id,
        node_id: triggerNode.id,
        run_at: new Date().toISOString(),
        status: "pending",
      });
      enrolled++;
    }

    return json({ ok: true, enrolled, skipped });
  }

  if (action === "lead_activity") {
    const leadId = String(body?.lead_id || "");
    if (!leadId) return json({ error: "lead_id is required." }, 400);

    // Sends for this lead (one row per email the engine dispatched).
    const { data: sends } = await admin
      .from("crm_email_sends")
      .select("id, node_id, subject, sg_message_id, sent_at")
      .eq("lead_id", leadId)
      .order("sent_at", { ascending: false });
    const sendRows = sends || [];
    const sendIds = sendRows.map((s) => s.id);

    // Engagement events for those sends.
    const { data: events } = sendIds.length
      ? await admin
          .from("crm_email_events")
          .select("send_id, event_type, url, occurred_at")
          .in("send_id", sendIds)
      : { data: [] as any[] };
    const eventRows = events || [];

    // Stats: count a send as opened/clicked at most once (SendGrid fires repeats).
    const openedSends = new Set<string>();
    const clickedSends = new Set<string>();
    let bounced = 0;
    let spam = 0;
    let unsub = 0;
    for (const e of eventRows) {
      const t = String(e.event_type);
      if (t === "open") openedSends.add(String(e.send_id));
      else if (t === "click") clickedSends.add(String(e.send_id));
      else if (t === "bounce" || t === "dropped") bounced++;
      else if (t === "spamreport") spam++;
      else if (t === "unsubscribe" || t === "group_unsubscribe") unsub++;
    }
    const stats = {
      sent: sendRows.length,
      opens: openedSends.size,
      clicks: clickedSends.size,
      bounced,
      spam,
      unsub,
    };

    // Latest enrollment for this lead, and a human label for the node it's parked on.
    const { data: enrollment } = await admin
      .from("crm_enrollments")
      .select("status, current_node_id, campaign_id, updated_at")
      .eq("lead_id", leadId)
      .order("updated_at", { ascending: false })
      .maybeSingle();

    let currentStep: string | null = null;
    let campaignName: string | null = null;
    if (enrollment?.campaign_id) {
      const { data: flowRow } = await admin
        .from("crm_campaign_flows")
        .select("name, flow")
        .eq("id", enrollment.campaign_id)
        .maybeSingle();
      campaignName = flowRow?.name ?? enrollment.campaign_id;
      const node = (flowRow?.flow?.nodes || []).find(
        (n: any) => n.id === enrollment.current_node_id,
      );
      currentStep = node?.data?.label ?? enrollment.current_node_id ?? null;
    }

    // Build one timeline from sends + events, newest first.
    const EVENT_LABEL: Record<string, { title: string; detail: string }> = {
      delivered: { title: "Email delivered", detail: "Message accepted by the recipient's mail server." },
      open: { title: "Email opened", detail: "Lead opened the message." },
      click: { title: "Link clicked", detail: "Lead clicked a link in the email." },
      bounce: { title: "Bounced", detail: "The address could not receive the message." },
      dropped: { title: "Dropped", detail: "SendGrid dropped the message before sending." },
      deferred: { title: "Deferred", detail: "Delivery temporarily delayed by the recipient server." },
      spamreport: { title: "Marked as spam", detail: "Lead reported the message as spam." },
      unsubscribe: { title: "Unsubscribed", detail: "Lead unsubscribed from emails." },
      group_unsubscribe: { title: "Unsubscribed", detail: "Lead unsubscribed from this group." },
      processed: { title: "Email processed", detail: "Message queued for delivery." },
    };

    const timeline = [
      ...sendRows.map((s) => ({
        kind: "sent",
        title: "Email sent",
        detail: s.subject || "Campaign email dispatched.",
        at: s.sent_at,
      })),
      ...eventRows.map((e) => {
        const meta = EVENT_LABEL[String(e.event_type)] || {
          title: String(e.event_type),
          detail: "",
        };
        return {
          kind: String(e.event_type),
          title: meta.title,
          detail: e.url ? `${meta.detail} (${e.url})`.trim() : meta.detail,
          at: e.occurred_at,
        };
      }),
    ]
      .filter((x) => x.at)
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 30);

    // A plain-language, non-AI summary of what actually happened.
    let summary: string;
    if (stats.sent === 0) {
      summary = "No campaign emails have been sent to this lead yet.";
    } else {
      const parts = [`${stats.sent} email${stats.sent === 1 ? "" : "s"} sent`];
      if (stats.opens) parts.push(`opened ${stats.opens}`);
      if (stats.clicks) parts.push(`clicked ${stats.clicks}`);
      if (stats.spam) parts.push(`reported spam`);
      if (stats.unsub) parts.push(`unsubscribed`);
      if (stats.bounced) parts.push(`${stats.bounced} bounced`);
      let s = parts.join(", ") + ".";
      if (enrollment) {
        s += ` Currently ${enrollment.status}` + (currentStep ? ` at "${currentStep}".` : ".");
      }
      summary = s;
    }

    return json({
      ok: true,
      stats,
      summary,
      enrollment: enrollment
        ? { status: enrollment.status, currentStep, campaignName }
        : null,
      timeline,
    });
  }

  return json({ error: `Unknown action: ${action}` }, 400);
});
