export const config = {
  runtime: "edge"
};

const SYSTEM_MESSAGE =
  "Answer using only the provided knowledge-base context. If the context is insufficient, say what is missing. Answer in 3-4 sentences. Do not invent facts. Include source filenames when useful.";

const OPENAI_API_BASE = "https://api.openai.com/v1";

type PineconeMatch = {
  score?: number;
  metadata?: {
    text?: unknown;
    source?: unknown;
    chunkIndex?: unknown;
  };
};

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...init.headers
    }
  });
}

function getEnv(name: string, fallback = "") {
  const env = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    PINECONE_HOST: process.env.PINECONE_HOST,
    PINECONE_NAMESPACE: process.env.PINECONE_NAMESPACE,
    OPENAI_EMBEDDING_MODEL: process.env.OPENAI_EMBEDDING_MODEL,
    OPENAI_ANSWER_MODEL: process.env.OPENAI_ANSWER_MODEL,
    QUERY_TOP_K: process.env.QUERY_TOP_K
  } as const;

  return env[name as keyof typeof env] || fallback;
}

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function createEmbedding(message: string) {
  const response = await fetch(`${OPENAI_API_BASE}/embeddings`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${getEnv("OPENAI_API_KEY")}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: getEnv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small"),
      input: message
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI embedding request failed with HTTP ${response.status}`);
  }

  const data = await response.json();
  const embedding = data?.data?.[0]?.embedding;

  if (!Array.isArray(embedding)) {
    throw new Error("OpenAI embedding response did not include an embedding.");
  }

  return embedding;
}

async function queryPinecone(vector: number[]) {
  const host = getEnv("PINECONE_HOST");

  if (!host) {
    throw new Error("Missing PINECONE_HOST.");
  }

  const response = await fetch(`https://${host}/query`, {
    method: "POST",
    headers: {
      "api-key": getEnv("PINECONE_API_KEY"),
      "content-type": "application/json"
    },
    body: JSON.stringify({
      vector,
      namespace: getEnv("PINECONE_NAMESPACE", "bnc-global"),
      topK: Number(getEnv("QUERY_TOP_K", "3")),
      includeMetadata: true,
      includeValues: false
    })
  });

  if (!response.ok) {
    throw new Error(`Pinecone query failed with HTTP ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data?.matches) ? (data.matches as PineconeMatch[]) : [];
}

function buildContext(matches: PineconeMatch[]) {
  return matches
    .map((match, index) => {
      const source = String(match.metadata?.source || "unknown");
      const chunkIndex = match.metadata?.chunkIndex ?? "?";
      const text = String(match.metadata?.text || "").trim();

      if (!text) {
        return "";
      }

      return `[${index + 1}] Source: ${source}, chunk ${chunkIndex}\n${text}`;
    })
    .filter(Boolean)
    .join("\n\n");
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

async function streamAnswer(message: string, context: string) {
  const response = await fetch(`${OPENAI_API_BASE}/responses`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${getEnv("OPENAI_API_KEY")}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: getEnv("OPENAI_ANSWER_MODEL", "gpt-4.1-mini"),
      stream: true,
      input: [
        {
          role: "system",
          content: SYSTEM_MESSAGE
        },
        {
          role: "user",
          content: `Question: ${message}\n\nKnowledge-base context:\n${context || "No relevant context was retrieved."}`
        }
      ]
    })
  });

  if (!response.ok || !response.body) {
    throw new Error(`OpenAI answer request failed with HTTP ${response.status}`);
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

          if (!payload || payload === "[DONE]") {
            continue;
          }

          try {
            const data = JSON.parse(payload);
            if (data.type === "response.output_text.delta" && data.delta) {
              pendingDeltas.push(data.delta);
            }
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

  if (!getEnv("OPENAI_API_KEY") || !getEnv("PINECONE_API_KEY")) {
    return jsonResponse({ error: "Missing server configuration." }, { status: 500 });
  }

  const body = await readJson(request);
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!message) {
    return jsonResponse({ error: "Message is required." }, { status: 400 });
  }

  try {
    const embedding = await createEmbedding(message);
    const matches = await queryPinecone(embedding);
    const context = buildContext(matches);
    const stream = await streamAnswer(message, context);

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
