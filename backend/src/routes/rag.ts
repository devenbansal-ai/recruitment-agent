import express from "express";
import { vector } from "../vector";
import { VectorResult } from "../vector/provider.types";
import { llm } from "../llm";

const router = express.Router();

router.post("/rag", async (req, res) => {
  try {
    const { query } = req.body;

    // Query Pinecone
    const results = await vector.query(query, 5);

    const context = results.map((m: VectorResult) => m.text).join("\n");

    const prompt = `Use the context below to answer:\n${context}\n\nQuestion: ${query}`;

    // Generate answer using retrieved context
    const response = await llm.generate(prompt, {
      messages: [{ role: "system", content: "You are a helpful RAG assistant." }],
    });

    res.json({
      answer: response.text,
      sources: results.map((m: VectorResult) => ({
        source: m.metadata?.source,
        page: m.metadata?.pageNumber,
        text: m.text,
        score: m.score,
      })),
    });
  } catch (err) {
    console.error("RAG error:", err);
    res.status(500).json({ error: "RAG retrieval failed" });
  }
});

export default router;
