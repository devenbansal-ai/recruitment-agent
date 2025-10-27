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
      return res.json({ ...cached, cached: true });
    }

    // Query Pinecone
    const results = await vector.query({ query, topK: 5 });

    const context = results.map((m: VectorResult) => m.text).join("\n");

    const prompt = `Use the context below to answer:\n${context}\n\nQuestion: ${query}`;

    // Generate answer using retrieved context
    const response = await llm.generate(prompt, {
      messages: [{ role: "system", content: "You are a helpful RAG assistant." }],
    });

    if (response.usage) {
      const cost = estimateCost(llm.model, response.usage);
      Logger.log(LOGGER_TAGS.LLM_ESTIMATED_COST, `$${cost.toFixed(6)}`);
      res.locals.cost = cost;
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
    res.json({ ...result, cached: false });
  } catch (err) {
    console.error("RAG error:", err);
    res.status(500).json({ error: "RAG retrieval failed" });
  }
});

export default router;
