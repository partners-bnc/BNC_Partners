import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

type PartnerRow = {
  partner_id: string;
  partner_email: string | null;
  ai_started_at: string | null;
  ai_last_activity_at: string | null;
  ai_completed_at: string | null;
  agreement_completed_at: string | null;
  last_reminder_stage: number | null;
  reminders_stopped_at: string | null;
  partner_profiles: {
    first_name: string | null;
    last_name: string | null;
    created_at: string | null;
    agreement_signed: boolean | null;
    agreement_signed_at: string | null;
  } | null;
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY") || "";
const FROM_EMAIL = Deno.env.get("ONBOARDING_REMINDER_FROM_EMAIL") || "no-reply@bncglobal.in";
const FROM_NAME = Deno.env.get("ONBOARDING_REMINDER_FROM_NAME") || "BnC Global";
const LOGIN_URL = Deno.env.get("ONBOARDING_REMINDER_LOGIN_URL") || "https://partners.bncglobal.in/login";
const SUPPORT_EMAIL = Deno.env.get("ONBOARDING_REMINDER_SUPPORT_EMAIL") || "wofa@bncglobal.in";
const SUPPORT_PHONE = Deno.env.get("ONBOARDING_REMINDER_SUPPORT_PHONE") || "+91 98105 75613";

const STAGE_1_HOURS = 24;
const STAGE_2_HOURS = 72;
const STAGE_3_HOURS = 24 * 7;
const STOP_HOURS = 24 * 14;
const MAX_USERS_PER_RUN = 200;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const MS_HOUR = 60 * 60 * 1000;

const escapeHtml = (value: string) =>
  String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");

const normalizeEmail = (value: string | null | undefined) => String(value || "").trim().toLowerCase();

const getAnchorDate = (row: PartnerRow) =>
  row.ai_last_activity_at || row.ai_started_at || row.partner_profiles?.created_at
    ? new Date(row.ai_last_activity_at || row.ai_started_at || (row.partner_profiles?.created_at as string))
    : null;

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(date);

const getStageByHoursPending = (hoursPending: number) => {
  if (hoursPending >= STAGE_3_HOURS) return 3;
  if (hoursPending >= STAGE_2_HOURS) return 2;
  if (hoursPending >= STAGE_1_HOURS) return 1;
  return 0;
};

const getSubject = (stage: number) => {
  if (stage >= 3) return "Final Reminder: Complete your AI Profile and Partner Agreement";
  if (stage === 2) return "Reminder: Your BnC Global partner onboarding is still pending";
  return "Action Required: Complete your AI Profile and Partner Agreement";
};

const renderEmailHtml = ({
  name,
  email,
  daysPending,
  deadlineDate,
  aiComplete,
  agreementSigned
}: {
  name: string;
  email: string;
  daysPending: number;
  deadlineDate: string;
  aiComplete: boolean;
  agreementSigned: boolean;
}) => {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const aiBadgeLabel = aiComplete ? "AI Profile Completed" : "AI Profile Not Completed";
  const aiBadgeBg = aiComplete ? "#dcfce7" : "#fee2e2";
  const aiBadgeIcon = aiComplete ? "OK" : "X";
  const agreementBadgeLabel = agreementSigned ? "Partner Agreement Signed" : "Partner Agreement Not Signed";
  const agreementBadgeBg = agreementSigned ? "#dcfce7" : "#fee2e2";
  const agreementBadgeIcon = agreementSigned ? "OK" : "X";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Action Required - Complete Your AI Profile and Agreement | BNC Global</title>
</head>
<body style="margin:0; padding:0; background-color:#f0f4f8; font-family:'Segoe UI', Arial, sans-serif;">
  <div style="display:none; max-height:0; overflow:hidden; font-size:1px; color:#f0f4f8;">
    Your BNC Global partner registration is incomplete. Complete your AI profile and agreement to activate your account.
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
                            Action Required
                          </span>
                        </td>
                      </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
                      <tr>
                        <td>
                          <p style="margin:0 0 6px; font-size:12px; color:rgba(255,255,255,0.7); letter-spacing:3px; text-transform:uppercase; font-weight:600;">Your Profile Is Incomplete</p>
                          <h1 style="margin:0 0 10px; font-size:27px; font-weight:700; color:#ffffff; line-height:1.35;">
                            Hey <span style="color:#a8d4f5;">${safeName}</span>, you're almost there!
                          </h1>
                          <p style="margin:0; font-size:15px; color:rgba(255,255,255,0.82); line-height:1.65;">
                            You registered successfully, but your AI profile and partner agreement are still pending. Complete them to fully activate your partner account.
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

                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                           style="background:#fffbeb; border:1.5px solid #fcd34d; border-radius:10px; margin-bottom:28px;">
                      <tr>
                        <td style="padding:18px 22px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="40" style="vertical-align:middle;">
                                <div style="font-size:20px; line-height:1;">PENDING</div>
                              </td>
                              <td style="vertical-align:middle; padding-left:12px;">
                                <p style="margin:0 0 2px; font-size:14px; font-weight:700; color:#92400e;">Account Activation Pending</p>
                                <p style="margin:0; font-size:13px; color:#b45309; line-height:1.5;">
                                  It's been <strong>${daysPending} days</strong> since you registered. Please complete your profile by <strong>${escapeHtml(deadlineDate)}</strong> to avoid any delays in activating your partner account.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 16px; font-size:13px; font-weight:700; color:#1e3a6e; letter-spacing:1.5px; text-transform:uppercase;">
                      What's Pending
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                           style="background:#fafbff; border:1px solid #e0e8f8; border-radius:8px; margin-bottom:12px;">
                      <tr>
                        <td style="padding:16px 20px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="36" style="vertical-align:middle;">
                                <div style="width:28px; height:28px; background:${aiBadgeBg}; border-radius:50%; text-align:center; line-height:28px; font-size:12px; font-weight:700; display:inline-block;">${aiBadgeIcon}</div>
                              </td>
                              <td style="vertical-align:middle; padding-left:12px;">
                                <p style="margin:0 0 2px; font-size:14px; font-weight:700; color:#1f2937;">${aiBadgeLabel}</p>
                                <p style="margin:0; font-size:13px; color:#6b7280; line-height:1.5;">Tell us about your business goals, expertise, and interests so we can match you with the right opportunities.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                           style="background:#fafbff; border:1px solid #e0e8f8; border-radius:8px; margin-bottom:28px;">
                      <tr>
                        <td style="padding:16px 20px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="36" style="vertical-align:middle;">
                                <div style="width:28px; height:28px; background:${agreementBadgeBg}; border-radius:50%; text-align:center; line-height:28px; font-size:12px; font-weight:700; display:inline-block;">${agreementBadgeIcon}</div>
                              </td>
                              <td style="vertical-align:middle; padding-left:12px;">
                                <p style="margin:0 0 2px; font-size:14px; font-weight:700; color:#1f2937;">${agreementBadgeLabel}</p>
                                <p style="margin:0; font-size:13px; color:#6b7280; line-height:1.5;">Review and digitally sign the BNC Global Partner Agreement to formally onboard and unlock all partner benefits.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                      <tr><td style="height:1px; background:#e5e7eb;"></td></tr>
                    </table>

                    <p style="margin:0 0 18px; font-size:13px; font-weight:700; color:#1e3a6e; letter-spacing:1.5px; text-transform:uppercase;">
                      How to Complete
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
                          <p style="margin:0; font-size:13px; color:#6b7280; line-height:1.55;">Answer the smart questions to build your partner profile. It only takes a few minutes.</p>
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
                          <p style="margin:0; font-size:13px; color:#6b7280; line-height:1.55;">Review and digitally sign your agreement to officially become a BNC Global Partner and unlock all benefits.</p>
                        </td>
                      </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                      <tr>
                        <td align="center">
                          <a href="${escapeHtml(LOGIN_URL)}"
                             style="display:inline-block; background:linear-gradient(135deg,#2C5AA0 0%,#1a8fc1 100%); color:#ffffff; text-decoration:none; font-size:16px; font-weight:700; padding:16px 48px; border-radius:8px; letter-spacing:0.3px;">
                            Complete Profile and Agreement
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 28px; font-size:12px; color:#9ca3af; text-align:center;">
                      Takes less than 2 minutes to complete
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                      <tr><td style="height:1px; background:#e5e7eb;"></td></tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                           style="background:#f0f6ff; border:1px solid #c7d9f5; border-radius:8px; margin-bottom:24px;">
                      <tr>
                        <td style="padding:20px 24px;">
                          <p style="margin:0 0 12px; font-size:13px; font-weight:700; color:#1e3a6e; letter-spacing:1px; text-transform:uppercase;">Why Complete Your Profile?</p>
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr><td style="font-size:13px; color:#374151; padding:3px 0;">- Get matched with relevant business opportunities</td></tr>
                            <tr><td style="font-size:13px; color:#374151; padding:3px 0;">- Unlock access to funding and consulting resources</td></tr>
                            <tr><td style="font-size:13px; color:#374151; padding:3px 0;">- Receive personalized partner support from our team</td></tr>
                            <tr><td style="font-size:13px; color:#374151; padding:3px 0;">- Officially activate your BNC Global Partner status</td></tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 4px; font-size:14px; color:#374151; line-height:1.6;">
                      Need help? Our team is happy to assist you through the process.
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
                      This is an automated reminder email. Please do not reply directly to this message.<br>
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

const sendBrevoEmail = async (to: string, subject: string, htmlContent: string) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
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

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Brevo send failed: ${details}`);
  }
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Missing Supabase service credentials." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  if (!BREVO_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing BREVO_API_KEY secret." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const now = new Date();
  const sendResults: Array<{ email: string; stage: number; status: string; reason?: string }> = [];

  try {
    const { data: partners, error } = await supabase
      .from("partner_onboarding_progress")
      .select(`
        partner_id,
        partner_email,
        ai_started_at,
        ai_last_activity_at,
        ai_completed_at,
        agreement_completed_at,
        last_reminder_stage,
        reminders_stopped_at,
        partner_profiles!inner(
          first_name,
          last_name,
          created_at,
          agreement_signed,
          agreement_signed_at
        )
      `)
      .is("reminders_stopped_at", null)
      .order("updated_at", { ascending: false })
      .limit(MAX_USERS_PER_RUN);

    if (error) {
      throw error;
    }

    const rows = (partners || []) as PartnerRow[];
    for (const row of rows) {
      const recipient = normalizeEmail(row.partner_email);
      if (!recipient) continue;

      const anchorDate = getAnchorDate(row);
      if (!anchorDate || Number.isNaN(anchorDate.getTime())) continue;

      const msPending = now.getTime() - anchorDate.getTime();
      const hoursPending = Math.floor(msPending / MS_HOUR);
      const stageDue = getStageByHoursPending(hoursPending);
      const currentStage = Number(row.last_reminder_stage || 0);

      const aiCompleted = Boolean(row.ai_completed_at);
      const agreementCompleted = Boolean(
        row.partner_profiles?.agreement_signed || row.agreement_completed_at || row.partner_profiles?.agreement_signed_at
      );

      if (aiCompleted && agreementCompleted) {
        await supabase
          .from("partner_onboarding_progress")
          .update({ reminders_stopped_at: now.toISOString() })
          .eq("partner_id", row.partner_id)
          .is("reminders_stopped_at", null);
        continue;
      }

      if (hoursPending >= STOP_HOURS) {
        await supabase
          .from("partner_onboarding_progress")
          .update({ reminders_stopped_at: now.toISOString() })
          .eq("partner_id", row.partner_id)
          .is("reminders_stopped_at", null);
        continue;
      }

      if (stageDue === 0 || stageDue <= currentStage) {
        continue;
      }

      const fullName = `${row.partner_profiles?.first_name || ""} ${row.partner_profiles?.last_name || ""}`.trim() || "Partner";
      const pendingDays = Math.max(1, Math.floor(hoursPending / 24));
      const deadline = new Date(anchorDate.getTime() + STOP_HOURS * MS_HOUR);
      const html = renderEmailHtml({
        name: fullName,
        email: recipient,
        daysPending: pendingDays,
        deadlineDate: formatDate(deadline),
        aiComplete: aiCompleted,
        agreementSigned: agreementCompleted
      });
      const subject = getSubject(stageDue);

      try {
        await sendBrevoEmail(recipient, subject, html);
        await supabase
          .from("partner_onboarding_progress")
          .update({
            last_reminder_stage: stageDue,
            last_reminder_sent_at: now.toISOString()
          })
          .eq("partner_id", row.partner_id);
        sendResults.push({ email: recipient, stage: stageDue, status: "sent" });
      } catch (sendError) {
        sendResults.push({
          email: recipient,
          stage: stageDue,
          status: "failed",
          reason: String(sendError instanceof Error ? sendError.message : sendError)
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      scanned: rows.length,
      sent: sendResults.filter((item) => item.status === "sent").length,
      failed: sendResults.filter((item) => item.status === "failed").length,
      details: sendResults
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : String(caught || "Unknown error");
    return new Response(JSON.stringify({ success: false, error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
