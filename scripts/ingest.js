import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import process from "node:process";
import dotenv from "dotenv";
import fg from "fast-glob";
import mammoth from "mammoth";
import OpenAI from "openai";
import pLimit from "p-limit";
import { Pinecone } from "@pinecone-database/pinecone";
import WordExtractor from "word-extractor";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ quiet: true });

const DOCUMENTS = [
  "BnC_global_inputs-_1_.doc",
  "BNC_Global_QA_GoogleSheet.doc",
  "Service - Sub Parts.docx"
];

const CONFIG = {
  pineconeApiKey: process.env.PINECONE_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  indexName: process.env.PINECONE_INDEX_NAME || "bnc-rag-kb",
  namespace: process.env.PINECONE_NAMESPACE || "bnc-global",
  cloud: process.env.PINECONE_CLOUD || "aws",
  region: process.env.PINECONE_REGION || "ap-southeast-1",
  fallbackRegions: parseList(process.env.PINECONE_FALLBACK_REGIONS || "us-east-1"),
  embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
  embeddingDimension: Number(process.env.OPENAI_EMBEDDING_DIMENSION || 1536),
  metric: process.env.PINECONE_METRIC || "cosine",
  chunkWords: Number(process.env.CHUNK_WORDS || 750),
  chunkOverlapWords: Number(process.env.CHUNK_OVERLAP_WORDS || 120),
  embedBatchSize: Number(process.env.EMBED_BATCH_SIZE || 64),
  upsertBatchSize: Number(process.env.UPSERT_BATCH_SIZE || 100),
  queryTopK: Number(process.env.QUERY_TOP_K || 5)
};

const DEFAULT_QUERIES = [
  "What services does BNC Global provide?",
  "What are the global input requirements?",
  "What are the service sub parts?"
];

async function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes("--check");
  const queryIndex = args.includes("--query");
  const askIndex = args.includes("--ask");
  const resetNamespace = args.includes("--reset");

  if (askIndex) {
    await answerQuestion(getFlagText(args, "--ask") || "What is BNC global?");
    return;
  }

  if (queryIndex) {
    await runQueries(getFlagText(args, "--query") || DEFAULT_QUERIES);
    return;
  }

  validateEnv(checkOnly);
  const documents = await loadDocuments();
  const chunks = buildChunks(documents);

  printExtractionSummary(documents, chunks);

  if (checkOnly) {
    return;
  }

  await ingestChunks(chunks, { resetNamespace });
  await runQueries(DEFAULT_QUERIES);
}

function validateEnv(checkOnly = false) {
  const missing = [];
  if (!CONFIG.pineconeApiKey && !checkOnly) missing.push("PINECONE_API_KEY");
  if (!CONFIG.openaiApiKey && !checkOnly) missing.push("OPENAI_API_KEY");

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables in .env.local: ${missing.join(", ")}`);
  }

  if (CONFIG.chunkOverlapWords >= CONFIG.chunkWords) {
    throw new Error("CHUNK_OVERLAP_WORDS must be lower than CHUNK_WORDS.");
  }
}

async function loadDocuments() {
  const discovered = await fg(DOCUMENTS, { cwd: process.cwd(), onlyFiles: true, caseSensitiveMatch: false });
  const missing = DOCUMENTS.filter((file) => !discovered.some((found) => found.toLowerCase() === file.toLowerCase()));

  if (missing.length > 0) {
    throw new Error(`Missing source document(s): ${missing.join(", ")}`);
  }

  const results = [];

  for (const relativePath of DOCUMENTS) {
    const absolutePath = path.resolve(relativePath);
    const extension = path.extname(relativePath).toLowerCase();
    const buffer = await readFileWithFriendlyError(absolutePath);
    const rawText = await extractText(absolutePath, extension);
    const text = normalizeText(rawText);
    const sourceHash = stableHash(`${path.basename(relativePath)}\n${text}`);

    results.push({
      filename: path.basename(relativePath),
      path: relativePath,
      extension,
      sourceHash,
      bytes: buffer.length,
      text
    });
  }

  return results;
}

async function readFileWithFriendlyError(filePath) {
  try {
    return await fs.readFile(filePath);
  } catch (error) {
    if (error.code === "EBUSY" || error.code === "EPERM") {
      throw new Error(`Cannot read ${path.basename(filePath)}. Close it in Word/preview and rerun.`);
    }
    throw error;
  }
}

async function extractText(filePath, extension) {
  try {
    if (extension === ".docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }

    if (extension === ".doc") {
      const extractor = new WordExtractor();
      const doc = await extractor.extract(filePath);
      return doc.getBody();
    }
  } catch (error) {
    if (error.code === "EBUSY" || error.code === "EPERM") {
      throw new Error(`Cannot parse ${path.basename(filePath)}. Close it in Word/preview and rerun.`);
    }

    throw new Error(`Failed to parse ${path.basename(filePath)}: ${error.message}`);
  }

  throw new Error(`Unsupported document type for ${path.basename(filePath)}.`);
}

function normalizeText(value) {
  return value
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stableHash(value) {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function buildChunks(documents) {
  const chunks = [];

  for (const document of documents) {
    const words = document.text.split(/\s+/).filter(Boolean);
    const step = CONFIG.chunkWords - CONFIG.chunkOverlapWords;
    let chunkIndex = 0;

    for (let start = 0; start < words.length; start += step) {
      const chunkWords = words.slice(start, start + CONFIG.chunkWords);
      const text = chunkWords.join(" ").trim();

      if (text.length < 40) {
        continue;
      }

      chunks.push({
        id: `${document.sourceHash}:${chunkIndex}`,
        text,
        metadata: {
          source: document.filename,
          fileType: document.extension.replace(".", ""),
          chunkIndex,
          sourceHash: document.sourceHash,
          text
        }
      });

      chunkIndex += 1;

      if (start + CONFIG.chunkWords >= words.length) {
        break;
      }
    }
  }

  return chunks;
}

function printExtractionSummary(documents, chunks) {
  console.log("\nExtraction summary");
  console.log("==================");

  for (const document of documents) {
    const documentChunks = chunks.filter((chunk) => chunk.metadata.sourceHash === document.sourceHash);
    console.log(`${document.filename}: ${document.text.length.toLocaleString()} chars, ${documentChunks.length} chunks`);
  }

  console.log(`Total chunks: ${chunks.length}`);
}

async function ingestChunks(chunks, { resetNamespace = false } = {}) {
  if (chunks.length === 0) {
    throw new Error("No chunks were created. Check the document extraction output.");
  }

  const openai = new OpenAI({ apiKey: CONFIG.openaiApiKey });
  const pinecone = new Pinecone({ apiKey: CONFIG.pineconeApiKey });

  await ensureIndex(pinecone);

  const index = pinecone.index(CONFIG.indexName).namespace(CONFIG.namespace);

  if (resetNamespace) {
    console.log(`Resetting namespace ${CONFIG.namespace} before ingest...`);
    await index.deleteAll();
  }

  let upserted = 0;

  for (const batch of toBatches(chunks, CONFIG.embedBatchSize)) {
    const embeddings = await embedBatch(openai, batch.map((chunk) => chunk.text));
    const vectors = batch.map((chunk, index) => ({
      id: chunk.id,
      values: embeddings[index],
      metadata: chunk.metadata
    }));

    for (const upsertBatch of toBatches(vectors, CONFIG.upsertBatchSize)) {
      await index.upsert(upsertBatch);
      upserted += upsertBatch.length;
      console.log(`Upserted ${upserted}/${chunks.length} vectors`);
    }
  }

  console.log(`\nIngested ${upserted} vectors into ${CONFIG.indexName}/${CONFIG.namespace}.`);
}

async function ensureIndex(pinecone) {
  const existing = await pinecone.listIndexes();
  const indexes = Array.isArray(existing) ? existing : existing.indexes || [];
  const found = indexes.some((index) => index.name === CONFIG.indexName);

  if (found) {
    const description = await pinecone.describeIndex(CONFIG.indexName);
    const dimension = description.dimension;
    const metric = description.metric;

    if (dimension !== CONFIG.embeddingDimension) {
      throw new Error(
        `Index ${CONFIG.indexName} has dimension ${dimension}, but ${CONFIG.embeddingModel} is configured for ${CONFIG.embeddingDimension}.`
      );
    }

    if (metric !== CONFIG.metric) {
      throw new Error(`Index ${CONFIG.indexName} uses metric ${metric}, expected ${CONFIG.metric}.`);
    }

    console.log(`Using existing Pinecone index ${CONFIG.indexName}.`);
    return;
  }

  const regionsToTry = uniqueValues([CONFIG.region, ...CONFIG.fallbackRegions]);

  for (const region of regionsToTry) {
    console.log(`Creating Pinecone index ${CONFIG.indexName} in ${CONFIG.cloud}/${region}...`);

    try {
      await pinecone.createIndex({
        name: CONFIG.indexName,
        dimension: CONFIG.embeddingDimension,
        metric: CONFIG.metric,
        spec: {
          serverless: {
            cloud: CONFIG.cloud,
            region
          }
        },
        deletionProtection: "disabled"
      });
      await waitForIndexReady(pinecone);
      return;
    } catch (error) {
      const isLastAttempt = region === regionsToTry.at(-1);
      const message = `Pinecone rejected ${CONFIG.cloud}/${region}: ${error.message}`;

      if (isLastAttempt) {
        throw new Error(
          `${message}\nTried regions: ${regionsToTry.join(", ")}. ` +
            "Change PINECONE_REGION or PINECONE_FALLBACK_REGIONS in .env.local and rerun."
        );
      }

      console.warn(`${message}\nTrying fallback region ${regionsToTry[regionsToTry.indexOf(region) + 1]}...`);
    }
  }
}

async function waitForIndexReady(pinecone) {
  const maxAttempts = 60;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const description = await pinecone.describeIndex(CONFIG.indexName);

    if (description.status?.ready) {
      console.log(`Pinecone index ${CONFIG.indexName} is ready.`);
      return;
    }

    console.log(`Waiting for Pinecone index to be ready (${attempt}/${maxAttempts})...`);
    await sleep(5000);
  }

  throw new Error(`Timed out waiting for Pinecone index ${CONFIG.indexName} to become ready.`);
}

async function embedBatch(openai, input) {
  const response = await openai.embeddings.create({
    model: CONFIG.embeddingModel,
    input
  });

  return response.data.map((item) => item.embedding);
}

async function runQueries(queryText) {
  validateEnv(false);

  const queries = Array.isArray(queryText) ? queryText : [queryText];
  const openai = new OpenAI({ apiKey: CONFIG.openaiApiKey });
  const pinecone = new Pinecone({ apiKey: CONFIG.pineconeApiKey });
  const index = pinecone.index(CONFIG.indexName).namespace(CONFIG.namespace);
  const limit = pLimit(2);

  console.log(`\nQuerying ${CONFIG.indexName}/${CONFIG.namespace}`);
  console.log("====================================");

  await Promise.all(
    queries.map((query) =>
      limit(async () => {
        const [embedding] = await embedBatch(openai, [query]);
        const result = await index.query({
          vector: embedding,
          topK: CONFIG.queryTopK,
          includeMetadata: true
        });

        console.log(`\nQuery: ${query}`);

        for (const match of result.matches || []) {
          const source = match.metadata?.source || "unknown";
          const chunkIndex = match.metadata?.chunkIndex ?? "?";
          const preview = String(match.metadata?.text || "").slice(0, 220).replace(/\s+/g, " ");
          console.log(`- ${source} chunk ${chunkIndex} score ${formatScore(match.score)}: ${preview}`);
        }
      })
    )
  );
}

async function answerQuestion(question) {
  validateEnv(false);

  const openai = new OpenAI({ apiKey: CONFIG.openaiApiKey });
  const pinecone = new Pinecone({ apiKey: CONFIG.pineconeApiKey });
  const index = pinecone.index(CONFIG.indexName).namespace(CONFIG.namespace);
  const [embedding] = await embedBatch(openai, [question]);
  const result = await index.query({
    vector: embedding,
    topK: CONFIG.queryTopK,
    includeMetadata: true
  });
  const matches = result.matches || [];
  const context = matches
    .map((match, index) => {
      const source = match.metadata?.source || "unknown";
      const chunkIndex = match.metadata?.chunkIndex ?? "?";
      const text = String(match.metadata?.text || "");
      return `[${index + 1}] Source: ${source}, chunk ${chunkIndex}\n${text}`;
    })
    .join("\n\n");

  const response = await openai.responses.create({
    model: process.env.OPENAI_ANSWER_MODEL || "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "Answer using only the provided knowledge-base context. If the context is insufficient, say what is missing. Answer in 3-4 sentences"
      },
      {
        role: "user",
        content: `Question: ${question}\n\nKnowledge-base context:\n${context}`
      }
    ]
  });

  console.log(`\nQuestion: ${question}`);
  console.log("\nAnswer");
  console.log("======");
  console.log(response.output_text.trim());
  console.log("\nSources");
  console.log("=======");

  for (const match of matches) {
    console.log(`- ${match.metadata?.source || "unknown"} chunk ${match.metadata?.chunkIndex ?? "?"} score ${formatScore(match.score)}`);
  }
}

function getFlagText(args, flag) {
  const flagIndex = args.indexOf(flag);
  return args.slice(flagIndex + 1).join(" ").trim();
}

function toBatches(items, size) {
  const batches = [];

  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }

  return batches;
}

function parseList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueValues(values) {
  return [...new Set(values)];
}

function formatScore(score) {
  return typeof score === "number" ? score.toFixed(4) : "n/a";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exitCode = 1;
});
