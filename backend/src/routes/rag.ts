import express from "express";
import { vector } from "../vector";
import { VectorResult } from "../vector/provider.types";
import { llm } from "../llm";
import { getCachedLLMResponse, setCachedLLMResponse } from "../llm/cache";
import Logger from "../utils/logger";
import { estimateCost } from "../utils/costTracker";
import { LOGGER_TAGS } from "../utils/tags";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { query } = req.body;
    const cacheKey = `rag:${query}`;
    const cached = getCachedLLMResponse(cacheKey);

    if (cached) {
      res.locals.cached = true;
      res.locals.cost = 0;
      console.log("Cache hit:", cacheKey);
      return res.json({ ...cached, cached: true, cost_usd: 0, total_tokens: 0 });
    }

    // Query Pinecone
    const results = await vector.query({ query, topK: 5 });

    const context = results.map((m: VectorResult) => m.text).join("\n");

    const prompt = `Use the context below to answer:\n${context}\n\nQuestion: ${query}`;

    // Generate answer using retrieved context
    const response = await llm.generate(prompt, {
      instructions: "You are a helpful RAG assistant",
    });

    let cost_usd: number | undefined;
    let total_tokens: number | undefined;

    if (response.usage) {
      cost_usd = estimateCost(llm.model, response.usage);
      total_tokens = response.usage.input_tokens + response.usage.output_tokens;
      Logger.log(LOGGER_TAGS.LLM_ESTIMATED_COST, `$${cost_usd.toFixed(6)}`);
      res.locals.cost = cost_usd;
    }

    const result = {
      answer: response.text,
      sources: results.map((m: VectorResult) => ({
        source: m.metadata?.source,
        page: m.metadata?.pageNumber,
        score: m.score,
      })),
    };

    setCachedLLMResponse(cacheKey, result);

    res.locals.cached = false;
    res.json({ ...result, cached: false, total_tokens, cost_usd });
  } catch (err) {
    console.error("RAG error:", err);
    res.status(500).json({ error: "RAG retrieval failed" });
  }
});

export default router;
