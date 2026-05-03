import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY") || "";
const FROM_EMAIL = Deno.env.get("FORM_NOTIFICATION_FROM_EMAIL") || "no-reply@bncglobal.in";
const FROM_NAME = Deno.env.get("FORM_NOTIFICATION_FROM_NAME") || "BNC Global";
const TO_EMAIL = Deno.env.get("FORM_NOTIFICATION_TO_EMAIL") || "summit@bncglobal.in";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const toTitle = (value: string) =>
  value
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const renderValue = (value: unknown) => {
  if (value === null || typeof value === "undefined" || value === "") return "N/A";
  if (Array.isArray(value)) return value.map((item) => String(item)).join(", ");
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
};

const renderRows = (fields: Record<string, unknown>) =>
  Object.entries(fields || {})
    .filter(([key]) => !["password", "token", "access_token", "refresh_token"].includes(key.toLowerCase()))
    .map(([key, value]) => `
      <tr>
        <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb; color:#475569; font-weight:700; width:34%;">
          ${escapeHtml(toTitle(key))}
        </td>
        <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb; color:#0f172a; white-space:pre-wrap;">
          ${escapeHtml(renderValue(value))}
        </td>
      </tr>
    `)
    .join("");

const sendBrevoEmail = async (subject: string, htmlContent: string) =>
  fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": BREVO_API_KEY
    },
    body: JSON.stringify({
      sender: {
        name: FROM_NAME,
        email: FROM_EMAIL
      },
      to: [{ email: TO_EMAIL }],
      subject,
      htmlContent
    })
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  if (!BREVO_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing BREVO_API_KEY secret" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    const payload = await req.json();
    const formType = String(payload?.formType || "").trim();
    const source = String(payload?.source || "unknown").trim();
    const createdAt = String(payload?.createdAt || new Date().toISOString());
    const submittedBy = payload?.submittedBy && typeof payload.submittedBy === "object"
      ? payload.submittedBy as Record<string, unknown>
      : {};
    const fields = payload?.fields && typeof payload.fields === "object"
      ? payload.fields as Record<string, unknown>
      : {};

    if (!formType) {
      return new Response(JSON.stringify({ error: "formType is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const subject = `New BNC Form Submission: ${formType}`;
    const submitterRows = renderRows(submittedBy);
    const fieldRows = renderRows(fields);

    const htmlContent = `
      <div style="margin:0; padding:0; background:#f8fafc; font-family:Arial, sans-serif; color:#0f172a;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:28px 16px; background:#f8fafc;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden;">
                <tr>
                  <td style="background:#224491; padding:24px 28px; color:#ffffff;">
                    <div style="font-size:12px; letter-spacing:1.6px; text-transform:uppercase; opacity:0.82;">BNC Global</div>
                    <h1 style="margin:8px 0 0; font-size:24px; line-height:1.3;">${escapeHtml(formType)}</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 16px; color:#475569;">
                      A new non-login form was submitted on the BNC partner site.
                    </p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; border:1px solid #e5e7eb; border-radius:8px; overflow:hidden; margin-bottom:22px;">
                      <tr>
                        <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb; color:#475569; font-weight:700; width:34%;">Source</td>
                        <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb;">${escapeHtml(source)}</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 12px; color:#475569; font-weight:700;">Submitted At</td>
                        <td style="padding:10px 12px;">${escapeHtml(createdAt)}</td>
                      </tr>
                    </table>

                    ${submitterRows ? `
                      <h2 style="margin:0 0 10px; font-size:16px;">Submitter</h2>
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; border:1px solid #e5e7eb; border-radius:8px; overflow:hidden; margin-bottom:22px;">
                        ${submitterRows}
                      </table>
                    ` : ""}

                    <h2 style="margin:0 0 10px; font-size:16px;">Submitted Details</h2>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; border:1px solid #e5e7eb; border-radius:8px; overflow:hidden;">
                      ${fieldRows || `<tr><td style="padding:12px; color:#64748b;">No details provided.</td></tr>`}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `;

    const brevoResponse = await sendBrevoEmail(subject, htmlContent);
    if (!brevoResponse.ok) {
      const details = await brevoResponse.text();
      return new Response(JSON.stringify({ error: "Brevo request failed", details }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const data = await brevoResponse.json();
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "Unknown error");
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
