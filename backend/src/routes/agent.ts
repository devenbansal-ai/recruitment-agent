import express from "express";
import { v4 as uuidv4 } from "uuid";
import { plan } from "../agents/planner";
import { executeAction } from "../agents/executor";
import { startTrace, appendStep, endAndPersistTrace } from "../agents/traceLogger";

const router = express.Router();

router.post("/", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  const requestId = uuidv4();
  const trace = startTrace(requestId, prompt);

  try {
    const actions = plan(prompt);
    let finalOutcome: string | undefined;

    let stepCounter = 0;
    for (const action of actions) {
      stepCounter++;
      const step = {
        step: stepCounter,
        timestamp: new Date().toISOString(),
        action,
        note: "Planned action",
      };
      appendStep(trace, step);

      const result = await executeAction(action);
      const stepResult = {
        step: stepCounter,
        timestamp: new Date().toISOString(),
        action,
        result,
      };
      appendStep(trace, stepResult);

      // basic stop-if-success policy; modify as needed
      if (result.success && action.tool === "vector_search") {
        finalOutcome = "found_relevant_docs";
        break;
      }
    }

    trace.outcome = finalOutcome ?? "completed";
    endAndPersistTrace(trace);

    return res.json({ requestId, traceFile: `/traces/${requestId}.json` });
  } catch (err) {
    appendStep(trace, {
      step: -1,
      timestamp: new Date().toISOString(),
      note: "fatal_error",
      result: { success: false, error: String(err) },
    });
    endAndPersistTrace(trace);
    return res.status(500).json({ error: String(err) });
  }
});

export default router;
