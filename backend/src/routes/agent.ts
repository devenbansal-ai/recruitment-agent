import express from "express";
import { runAgent } from "../agents/orchestrator";
import { LOGGER_TAGS } from "../utils/tags";
import { estimateCost } from "../utils/costTracker";
import { llm } from "../llm";
import Logger from "../utils/logger";
import { toolRegistry } from "../agents/registry";
import { Telemetry } from "../utils/telemetry";
import { limit } from "../utils/concurency";

const router = express.Router();

router.post("/ask", async (req, res) => {
  await limit(async () => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Missing query" });

    const telemetry = new Telemetry("/agent/ask");

    try {
      const response = await runAgent(query);

      const cost = estimateCost(llm.model, response.usage);
      Logger.log(LOGGER_TAGS.LLM_ESTIMATED_COST, `$${cost.toFixed(6)}`);
      res.locals.cost = cost;

      const telemetryResult = telemetry.end(response.usage, llm.model);

      res.json({ output: response.output, trace: response.trace, telemetry: telemetryResult });
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

export default router;
