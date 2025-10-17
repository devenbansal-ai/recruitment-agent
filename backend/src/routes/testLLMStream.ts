import express from "express";
import { llm } from "../llm";

const router = express.Router();

router.get("/test-llm-stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const handler = {
    onData: (chunk: string) => res.write(`data: ${chunk}\n\n`),
    onEnd: () => res.end(),
    onError: (err: Error) => {
      console.error(err);
      res.write(`event: error\ndata: ${err.message}\n\n`);
      res.end();
    },
  };

  await llm.stream("Give me a short self-introduction for a software engineer", handler);
});

export default router;
