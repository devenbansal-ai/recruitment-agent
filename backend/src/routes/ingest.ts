import express from "express";
import { vector } from "../vector";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { text, source, pageNumber }: { text?: string; source?: string; pageNumber?: number } =
      req.body;

    if (!text || !source) {
      return res.status(400).json({ error: "Missing text or source" });
    }

    const chunksIngested = vector.ingest(text, source, pageNumber);
    res.json({ success: true, chunks_ingested: chunksIngested });
  } catch (err) {
    console.error("Ingestion error:", err);
    res.status(500).json({ error: "Failed to ingest document" });
  }
});

export default router;
