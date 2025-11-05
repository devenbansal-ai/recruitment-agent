import express from "express";
import { runAgent } from "../agents/orchestrator";
import { LOGGER_TAGS } from "../utils/tags";
import { estimateCost } from "../utils/costTracker";
import { llm } from "../llm";
import Logger from "../utils/logger";
import { describeAllTools, toolRegistry } from "../agents/registry";
import { Telemetry } from "../utils/telemetry";
import { limit } from "../utils/concurency";
import { getStreamHandler } from "../utils/stream";

const router = express.Router();

router.post("/ask", async (req, res) => {
  await limit(async () => {
    const { query, file } = req.body;
    if (!query) return res.status(400).json({ error: "Missing query" });

    // Set headers for SSE (Server-Sent Events)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const telemetry = new Telemetry("/agent/ask");

    const streamHandler = getStreamHandler(res);

    try {
      const response = await runAgent(query, streamHandler, file);

      const cost = estimateCost(llm.model, response.usage);
      Logger.log(LOGGER_TAGS.LLM_ESTIMATED_COST, `$${cost.toFixed(6)}`);
      res.locals.cost = cost;

      const telemetryResult = telemetry.end(response.usage, llm.model);
      streamHandler.onEnd(telemetryResult);
    } catch (err) {
      return res.status(500).json({ error: String(err) });
    }
  });
});

router.post("/retry", async (req, res) => {
  try {
    const { action, input } = req.body;
    const tool = toolRegistry.get(action);
    if (!tool) return res.status(400).json({ error: "Unknown tool" });

    const output = await tool.execute(input);
    res.json({ output });
  } catch (e) {
    console.error("Retry error:", e);
    res.status(500).json({ error: "Retry failed" });
  }
});

router.get("/tools", async (req, res) => {
  res.json({ tools: describeAllTools(toolRegistry.tools) });
});

export default router;
