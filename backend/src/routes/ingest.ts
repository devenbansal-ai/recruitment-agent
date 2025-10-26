import express from "express";
import { chunkTextWithMetadata } from "../embed/chunker";
import { vector } from "../vector";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { text, source, pageNumber }: { text?: string; source?: string; pageNumber?: number } =
      req.body;

    if (!text || !source) {
      return res.status(400).json({ error: "Missing text or source" });
    }

    const chunks = await chunkTextWithMetadata(text, source, pageNumber);

    const vectors = chunks.map((e, i) => ({
      id: e.id,
      text: e.content,
      metadata: e.metadata,
    }));

    await vector.upsert(vectors);
    res.json({ success: true, chunksIngested: chunks.length });
  } catch (err) {
    console.error("Ingestion error:", err);
    res.status(500).json({ error: "Failed to ingest document" });
  }
});

export default router;
