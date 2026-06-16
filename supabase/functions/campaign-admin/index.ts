// campaign-admin — admin-only control plane for the campaign engine.
//
// Two actions (POST { action, ... }):
//   • publish: snapshot a flow (with embedded template content) into crm_campaign_flows.
//   • enroll:  enroll one or more crm_leads into a published campaign (creates the first job).
//
// Auth: JWT-protected. The caller's Supabase session JWT is verified, then we confirm the
// user has a row in admin_profiles before doing any service-role write.
// Deploy normally (JWT verification ON): supabase functions deploy campaign-admin
//
// Required secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
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
  if (!authHeader) return json({ error: "Missing Authorization." }, 401);

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: { user }, error } = await userClient.auth.getUser();
  if (error || !user) return json({ error: "Invalid session." }, 401);

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

  return json({ error: `Unknown action: ${action}` }, 400);
});
