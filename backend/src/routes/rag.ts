import express from "express";
import { vector } from "../vector";
import { llm } from "../llm";
import { getCachedLLMResponse, setCachedLLMResponse } from "../llm/cache";
import Logger from "../utils/logger";
import { estimateCost } from "../utils/costTracker";
import { LOGGER_TAGS } from "../utils/tags";
import { getStreamHandler } from "../utils/stream";
import { getCitationSourcesFromVectorResults, getContextFromVectorResults } from "../utils/vector";

const router = express.Router();
const RAG_INSTRUCTIONS = `You are a helpful assistant using retrieved documents to answer questions.
Each document is prefixed by a number in square brackets [1], [2], etc.
When you write the answer, cite sources inline using their numbers, like this: [1][3].
If multiple sources support the same fact, cite all of them.

If you cannot find the answer in the retrieved documents, say "I don’t have enough information from the provided sources."
`;

router.post("/", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Missing query" });

    const cacheKey = `rag:${query}`;
    const cached = getCachedLLMResponse(cacheKey);

    if (cached) {
      res.locals.cached = true;
      res.locals.cost = 0;
      console.log("Cache hit:", cacheKey);
      return res.json({ ...cached, cached: true, cost_usd: 0, total_tokens: 0 });
    }

    // Query Pinecone
    const vectorSearchResults = await vector.query({ query, topK: 5 });

    const context = getContextFromVectorResults(vectorSearchResults);
    const sources = getCitationSourcesFromVectorResults(vectorSearchResults);

    const userPrompt = `
    Question: ${query}

    Retrieved Documents:
    ${context}

    Answer:
    `;

    // Generate answer using retrieved context
    const response = await llm.generate(userPrompt, {
      instructions: RAG_INSTRUCTIONS,
    });

    let cost_usd: number | undefined;
    let total_tokens: number | undefined;

    if (response.usage) {
      cost_usd = estimateCost(llm.model, response.usage);
      total_tokens = response.usage.input_tokens + response.usage.output_tokens;
      Logger.log(LOGGER_TAGS.LLM_ESTIMATED_COST, `$${cost_usd.toFixed(6)}`);
      res.locals.cost = cost_usd;
    }

    const citations = [...new Set(response.text.match(/\[(\d+)\]/g))].map((c) =>
      parseInt(c.replace(/\[|\]/g, ""), 10)
    );

    const usedSources = sources.filter((_, i) => citations.includes(i + 1));

    const result = {
      output: response.text,
      sources: usedSources,
    };

    setCachedLLMResponse(cacheKey, result);

    res.locals.cached = false;
    res.json({ ...result, cached: false, total_tokens, cost_usd });
  } catch (err) {
    console.error("RAG error:", err);
    res.status(500).json({ error: "RAG retrieval failed" });
  }
});

router.post("/stream", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Missing query" });

    // Set headers for SSE (Server-Sent Events)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // Query Pinecone
    const vectorSearchResults = await vector.query({ query, topK: 5 });

    const context = getContextFromVectorResults(vectorSearchResults);

    const prompt = `Use the context below to answer:\n${context}\n\nQuestion: ${query}`;

    await llm.stream(prompt, getStreamHandler(res), {
      instructions: RAG_INSTRUCTIONS,
    });
  } catch (err) {
    console.error("RAG error:", err);
    res.status(500).json({ error: "RAG retrieval failed" });
  }
});

export default router;
