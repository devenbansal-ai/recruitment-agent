import express from "express";
import { runAgent } from "../agents/orchestrator";
import { LOGGER_TAGS } from "../utils/tags";
import { estimateCost } from "../utils/costTracker";
import { llm } from "../llm";
import Logger from "../utils/logger";

const router = express.Router();

router.post("/ask", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  try {
    const response = await runAgent(prompt);

    const cost = estimateCost(llm.model, response.usage);
    Logger.log(LOGGER_TAGS.LLM_ESTIMATED_COST, `$${cost.toFixed(6)}`);
    res.locals.cost = cost;

    res.json(response);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

export default router;
