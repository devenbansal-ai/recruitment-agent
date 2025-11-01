import express from "express";
import { runAgent } from "../agents/orchestrator";
import { LOGGER_TAGS } from "../utils/tags";
import { estimateCost } from "../utils/costTracker";
import { llm } from "../llm";
import Logger from "../utils/logger";
import { toolRegistry } from "../agents/registry";

const router = express.Router();

router.post("/ask", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Missing query" });

  try {
    const response = await runAgent(query);

    const cost = estimateCost(llm.model, response.usage);
    Logger.log(LOGGER_TAGS.LLM_ESTIMATED_COST, `$${cost.toFixed(6)}`);
    res.locals.cost = cost;

    res.json(response);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
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
