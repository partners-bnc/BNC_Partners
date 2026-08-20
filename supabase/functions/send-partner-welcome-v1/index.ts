import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY") || "";
const FROM_EMAIL = Deno.env.get("WELCOME_FROM_EMAIL") || "no-reply@bncglobal.in";
const FROM_NAME = Deno.env.get("WELCOME_FROM_NAME") || "BnC Global";
const LOGIN_URL = Deno.env.get("WELCOME_LOGIN_URL") || "https://partners.bncglobal.in/login";
const SUPPORT_EMAIL = Deno.env.get("WELCOME_SUPPORT_EMAIL") || "wofa@bncglobal.in";
const SUPPORT_PHONE = Deno.env.get("WELCOME_SUPPORT_PHONE") || "+91 98105 75613";

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

const normalizeEmail = (value: unknown) => String(value ?? "").trim().toLowerCase();

const renderWelcomeHtml = ({
  name,
  email,
  loginUrl
}: {
  name: string;
  email: string;
  loginUrl: string;
}) => {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeLoginUrl = escapeHtml(loginUrl);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to BNC Global</title>
</head>
<body style="margin:0; padding:0; background-color:#f0f4f8; font-family:'Segoe UI', Arial, sans-serif;">
  <div style="display:none; max-height:0; overflow:hidden; font-size:1px; color:#f0f4f8;">
    Welcome to BNC Global! Your partner account is created. Complete your AI profile and agreement to get started.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f4f8; padding:40px 16px;">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;">
          <tr>
            <td style="background:#ffffff; border-radius:12px 12px 0 0; overflow:hidden;">

              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#1e3a6e 0%,#2C5AA0 60%,#1a8fc1 100%); padding:36px 40px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td>
                          <img src="https://static.wixstatic.com/media/0446e3_50ff54e1251b45ef8a1066bca3a75b0e~mv2.png" width="100" alt="BNC Global" style="display:block; filter:brightness(1.2);">
                        </td>
                        <td align="right" style="vertical-align:middle;">
                          <span style="background:rgba(245,158,11,0.25); border:1px solid rgba(245,158,11,0.6); color:#fcd34d; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; padding:5px 14px; border-radius:20px;">
                            Welcome
                          </span>
                        </td>
                      </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
                      <tr>
                        <td>
                          <p style="margin:0 0 6px; font-size:12px; color:rgba(255,255,255,0.7); letter-spacing:3px; text-transform:uppercase; font-weight:600;">Your Account Is Ready</p>
                          <h1 style="margin:0 0 10px; font-size:27px; font-weight:700; color:#ffffff; line-height:1.35;">
                            Welcome aboard, <span style="color:#a8d4f5;">${safeName}</span>!
                          </h1>
                          <p style="margin:0; font-size:15px; color:rgba(255,255,255,0.82); line-height:1.65;">
                            Thank you for registering as a BnC Global partner. Your account has been created successfully. Just a couple of quick steps and you'll be fully activated.
                          </p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:32px 40px;">

                    <p style="margin:0 0 18px; font-size:13px; font-weight:700; color:#1e3a6e; letter-spacing:1.5px; text-transform:uppercase;">
                      Get Started In 3 Steps
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
                      <tr>
                        <td width="46" style="vertical-align:top;">
                          <div style="width:34px; height:34px; background:linear-gradient(135deg,#2C5AA0,#1a8fc1); border-radius:50%; text-align:center; line-height:34px; font-size:14px; font-weight:700; color:#fff; display:inline-block;">1</div>
                        </td>
                        <td style="vertical-align:top; padding-top:5px;">
                          <p style="margin:0 0 3px; font-size:14px; font-weight:700; color:#1f2937;">Login to Your Account</p>
                          <p style="margin:0; font-size:13px; color:#6b7280; line-height:1.55;">
                            Sign in using your registered email: <strong style="color:#1e3a6e;">${safeEmail}</strong>
                          </p>
                        </td>
                      </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
                      <tr>
                        <td width="46" style="vertical-align:top;">
                          <div style="width:34px; height:34px; background:linear-gradient(135deg,#1e6ea8,#2C5AA0); border-radius:50%; text-align:center; line-height:34px; font-size:14px; font-weight:700; color:#fff; display:inline-block;">2</div>
                        </td>
                        <td style="vertical-align:top; padding-top:5px;">
                          <p style="margin:0 0 3px; font-size:14px; font-weight:700; color:#1f2937;">Complete Your AI Profile</p>
                          <p style="margin:0; font-size:13px; color:#6b7280; line-height:1.55;">Answer a few smart questions so we can match you with the right opportunities. It only takes a few minutes.</p>
                        </td>
                      </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:30px;">
                      <tr>
                        <td width="46" style="vertical-align:top;">
                          <div style="width:34px; height:34px; background:linear-gradient(135deg,#1a5580,#1e6ea8); border-radius:50%; text-align:center; line-height:34px; font-size:14px; font-weight:700; color:#fff; display:inline-block;">3</div>
                        </td>
                        <td style="vertical-align:top; padding-top:5px;">
                          <p style="margin:0 0 3px; font-size:14px; font-weight:700; color:#1f2937;">Sign the Partner Agreement</p>
                          <p style="margin:0; font-size:13px; color:#6b7280; line-height:1.55;">Review and digitally sign your agreement to officially become a BnC Global Partner and unlock all benefits.</p>
                        </td>
                      </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                      <tr>
                        <td align="center">
                          <a href="${safeLoginUrl}"
                             style="display:inline-block; background:linear-gradient(135deg,#2C5AA0 0%,#1a8fc1 100%); color:#ffffff; text-decoration:none; font-size:16px; font-weight:700; padding:16px 48px; border-radius:8px; letter-spacing:0.3px;">
                            Login and Get Started
                          </a>
                        </td>
                      </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                      <tr><td style="height:1px; background:#e5e7eb;"></td></tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                           style="background:#f0f6ff; border:1px solid #c7d9f5; border-radius:8px; margin-bottom:24px;">
                      <tr>
                        <td style="padding:20px 24px;">
                          <p style="margin:0 0 12px; font-size:13px; font-weight:700; color:#1e3a6e; letter-spacing:1px; text-transform:uppercase;">What You'll Unlock</p>
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr><td style="font-size:13px; color:#374151; padding:3px 0;">- Get matched with relevant business opportunities</td></tr>
                            <tr><td style="font-size:13px; color:#374151; padding:3px 0;">- Access to funding and consulting resources</td></tr>
                            <tr><td style="font-size:13px; color:#374151; padding:3px 0;">- Personalized partner support from our team</td></tr>
                            <tr><td style="font-size:13px; color:#374151; padding:3px 0;">- Official BnC Global Partner status</td></tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 4px; font-size:14px; color:#374151; line-height:1.6;">
                      Need help getting started? Our team is happy to assist you.
                    </p>
                    <p style="margin:0; font-size:14px; color:#6b7280;">
                      <a href="mailto:${escapeHtml(SUPPORT_EMAIL)}" style="color:#2C5AA0; text-decoration:none;">${escapeHtml(SUPPORT_EMAIL)}</a> |
                      <a href="tel:${escapeHtml(SUPPORT_PHONE)}" style="color:#2C5AA0; text-decoration:none;">${escapeHtml(SUPPORT_PHONE)}</a>
                    </p>

                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:#f8faff; border-top:1px solid #e5e7eb; padding:24px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="130" style="vertical-align:middle; padding-right:20px; border-right:1px solid #dbe6f8;">
                          <img src="https://static.wixstatic.com/media/0446e3_50ff54e1251b45ef8a1066bca3a75b0e~mv2.png"
                               width="120" alt="BNC Global" style="display:block;">
                        </td>
                        <td style="vertical-align:top; padding-left:20px;">
                          <p style="margin:0 0 4px; font-size:14px; font-weight:700; color:#1e3a6e;">BnC Global Services Pvt. Ltd.</p>
                          <p style="margin:0 0 2px; font-size:12px; color:#6b7280;"><a href="https://www.bncglobal.in" style="color:#2C5AA0; text-decoration:none;">www.bncglobal.in</a></p>
                          <p style="margin:0 0 2px; font-size:12px; color:#6b7280;">${escapeHtml(SUPPORT_EMAIL)}</p>
                          <p style="margin:0 0 8px; font-size:12px; color:#6b7280;">${escapeHtml(SUPPORT_PHONE)}</p>
                          <p style="margin:0 0 2px; font-size:11px; color:#9ca3af; line-height:1.6;">
                            Startup Consulting and Funding | Outsourcing | Training<br>
                            Shared Services | Advisory | Recruitment
                          </p>
                          <p style="margin:6px 0 0; font-size:12px; font-style:italic; color:#2C5AA0; font-weight:600;">
                            "A Complete Financial Ecosystem!"
                          </p>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:20px 0 0; font-size:11px; color:#9ca3af; text-align:center; line-height:1.6;">
                      This is an automated message. Please do not reply directly to this email.<br>
                      Copyright 2014 BnC Global Services Pvt. Ltd. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <tr>
            <td style="background:linear-gradient(90deg,#b45309 0%,#f59e0b 50%,#b45309 100%); height:4px; border-radius:0 0 10px 10px;"></td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
};

const sendBrevoEmail = async (to: string, subject: string, htmlContent: string) =>
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
      to: [{ email: to }],
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
    const recipient = normalizeEmail(payload?.email);
    const firstName = String(payload?.firstName ?? "").trim();
    const lastName = String(payload?.lastName ?? "").trim();
    const loginUrl = String(payload?.loginUrl ?? "").trim() || LOGIN_URL;

    if (!recipient) {
      return new Response(JSON.stringify({ error: "email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const fullName = `${firstName} ${lastName}`.trim() || "Partner";
    const subject = "Welcome to BnC Global - Let's complete your onboarding";
    const htmlContent = renderWelcomeHtml({ name: fullName, email: recipient, loginUrl });

    const brevoResponse = await sendBrevoEmail(recipient, subject, htmlContent);
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
