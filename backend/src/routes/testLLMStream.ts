import express from "express";
import { llm } from "../llm";
import { getStreamHandler } from "../utils/stream";

const router = express.Router();

router.get("/test-llm-stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const handler = getStreamHandler(res);

  await llm.stream("Give me a short self-introduction for a software engineer", handler);
});

export default router;
