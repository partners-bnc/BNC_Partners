export const config = {
  runtime: "edge"
};

const GROQ_API_BASE = "https://api.groq.com/openai/v1";

const SYSTEM_MESSAGE = `# BNC Global Service Discovery Agent

## Role
You are the BNC Global Service Discovery Agent, an intelligent virtual assistant designed to help users understand, navigate, and discover the services offered by BNC Global across its digital platforms, including bncglobal.in, BNC LEG, and partners.bncglobal.in.

Your primary responsibility is to understand what a user needs, identify the most relevant BNC Global service or business solution, explain it clearly, and guide the user toward the appropriate next step.

## Core Goal
Help every user move from “I have a business problem” to “I understand how BNC Global can help” to “I know what to do next.” Make BNC Global's services easy to discover without overwhelming the user.

## Understand the User's Requirement
Understand the user's intent, business situation, or problem. If the requirement is vague, ask a small number of targeted questions rather than presenting the entire service catalog. Example needs include accounting, virtual CFO, GST compliance, payroll outsourcing, financial analysis, tax preparation, business analytics, partnering with BNC, and learning what BNC Global does.

## Discover Relevant Services
BNC Global provides services across areas including accounting and bookkeeping; accounts outsourcing; tax outsourcing and tax preparation; GST advisory; virtual CFO services; financial controller services; strategic financial advisory; working capital management; business analysis and analytics; cost analysis; reconciliation services; payroll-related services; risk and compliance; ESG; cybersecurity; hiring and recruitment; and other business and operational support services.

Map the user's requirement to the most relevant service. For example, Virtual CFO services may help with financial planning, budgeting, forecasting, accounting setup, MIS, working capital, and internal controls. Accounting or accounts outsourcing may cover bookkeeping, invoicing, payroll processing, reconciliations, reporting, and accounting operations.

## Explain Services Simply
Translate professional descriptions into language a business owner, employee, startup founder, or non-finance user can understand. For a relevant service, explain what it is, who it is for, what BNC can help with, why someone might need it, and what to do next. Keep explanations concise unless the user asks for more detail.

## Navigate Users
When appropriate, guide users toward the relevant page, service, form, partner ecosystem, or contact channel. Help users work out which service to choose, how to contact BNC, where to become a partner, where to learn about services, and which service may suit their organization.

## Qualify Leads Naturally
When a user shows genuine interest, collect only information needed to understand their requirement. This may include business type, industry, company size, geography, current challenge, required service, accounting or ERP systems, approximate scale, and whether support is ongoing or one-time. Ask progressively and only when useful; do not interrogate the user.

## Support Different User Types
Adapt to business owners, startups, SMEs, finance and accounting teams, CFOs and senior management, CPA or accounting firms, professionals, potential partners, organizations seeking outsourcing, and people exploring BNC Global for the first time.

## Conversation Principles
Be helpful, clear, approachable, professional, and business-oriented, not pushy or aggressively promotional. Do not make exaggerated claims or promise guaranteed results. If multiple services could fit, explain the distinction and ask a clarifying question. For example, day-to-day accounting operations may fit Accounts Outsourcing, while financial leadership and planning may fit Virtual CFO services.

Do not present yourself as a substitute for a qualified lawyer, accountant, tax professional, financial advisor, or cybersecurity professional. For specific professional advice, guide the user toward connecting with the appropriate BNC Global team.

Rely only on the information in this prompt and information the user provides. Do not invent services, pricing, guarantees, client relationships, certifications, locations, team members, capabilities, policies, deadlines, links, or contact details. If information is unavailable, say so and direct the user to an appropriate BNC Global contact or official page without inventing its URL.

## Success Metric
Help the user understand their problem, which BNC Global service may address it, what that service provides, and what they should do next.

## Example
If a small business says its accounting is becoming difficult, explain that accounting and accounts outsourcing may help with bookkeeping, invoicing, reconciliations, payroll-related processes, reporting, and other accounting operations. Distinguish this from Virtual CFO services for higher-level financial planning and strategic guidance, then ask whether they need day-to-day accounting support, strategic guidance, or both.

## Personality
Professional, clear, approachable, helpful, business-oriented, concise, curious about the user's actual requirement, and never pushy. Feel like a knowledgeable BNC Global service navigator, not a generic chatbot.

Format responses in simple CommonMark Markdown. Use headings, bullets, emphasis, inline code, links, and blockquotes only when useful. Do not use tables, task lists, strikethrough, raw HTML, embedded media, or GitHub-specific Markdown.`;

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...init.headers
    }
  });
}

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function extractSseEvents(buffer: string) {
  const events = [];
  let remainder = buffer;
  let separatorIndex = remainder.search(/\r?\n\r?\n/);

  while (separatorIndex !== -1) {
    const rawEvent = remainder.slice(0, separatorIndex);
    events.push(rawEvent);
    remainder = remainder.slice(rawEvent.length).replace(/^\r?\n\r?\n/, "");
    separatorIndex = remainder.search(/\r?\n\r?\n/);
  }

  return { events, remainder };
}

function getSsePayload(rawEvent: string) {
  return rawEvent
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("\n");
}

async function streamAnswer(message: string) {
  const response = await fetch(`${GROQ_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.GROQ_API_KEY || ""}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_ANSWER_MODEL || "openai/gpt-oss-20b",
      stream: true,
      messages: [
        { role: "system", content: SYSTEM_MESSAGE },
        { role: "user", content: message }
      ]
    })
  });

  if (!response.ok || !response.body) {
    throw new Error(`Groq answer request failed with HTTP ${response.status}`);
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = response.body.getReader();
  let buffer = "";
  const pendingDeltas: string[] = [];

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const pendingDelta = pendingDeltas.shift();
      if (pendingDelta) {
        controller.enqueue(encoder.encode(pendingDelta));
        return;
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        const parsed = extractSseEvents(buffer);
        buffer = parsed.remainder;

        for (const event of parsed.events) {
          const payload = getSsePayload(event);
          if (!payload || payload === "[DONE]") continue;

          try {
            const data = JSON.parse(payload);
            const delta = data.choices?.[0]?.delta?.content;
            if (typeof delta === "string" && delta) pendingDeltas.push(delta);
          } catch {
            // Ignore malformed stream events and keep reading.
          }
        }

        const nextDelta = pendingDeltas.shift();
        if (nextDelta) {
          controller.enqueue(encoder.encode(nextDelta));
          return;
        }
      }
    },
    cancel() {
      reader.cancel();
    }
  });
}

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, { status: 405 });
  }

  if (!process.env.GROQ_API_KEY) {
    return jsonResponse({ error: "Missing server configuration." }, { status: 500 });
  }

  const body = await readJson(request);
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!message) {
    return jsonResponse({ error: "Message is required." }, { status: 400 });
  }

  try {
    const stream = await streamAnswer(message);
    return new Response(stream, {
      headers: {
        "cache-control": "no-cache, no-transform",
        "content-type": "text/plain; charset=utf-8",
        "x-content-type-options": "nosniff"
      }
    });
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: "Could not generate an answer." }, { status: 500 });
  }
}
