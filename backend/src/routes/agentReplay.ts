// src/routes/agentReplay.ts
import express from "express";
import fs from "fs";
import path from "path";
const router = express.Router();

const TRACE_DIR = path.resolve(process.cwd(), "traces");

function readTrace(requestId: string) {
  const file = path.join(TRACE_DIR, `${requestId}.json`);
  if (!fs.existsSync(file)) throw new Error("Trace not found");
  const raw = fs.readFileSync(file, "utf-8");
  return JSON.parse(raw);
}

// Raw trace (for download)
router.get("/:requestId/raw", (req, res) => {
  try {
    const trace = readTrace(req.params.requestId);
    res.json(trace);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// Parsed steps view: friendly summary per step
router.get("/:requestId/steps", (req, res) => {
  try {
    const trace = readTrace(req.params.requestId);
    const parsed = (trace.steps ?? []).map((s: any) => ({
      step: s.step,
      timestamp: s.timestamp,
      tool: s.action?.tool ?? null,
      input: s.action?.input ?? null,
      resultSuccess: s.result?.success ?? null,
      resultSummary:
        s.result?.success && s.result.output
          ? summarizeOutput(s.action?.tool, s.result.output)
          : (s.result?.error ?? null),
      note: s.note ?? null,
    }));
    res.json({
      requestId: trace.requestId,
      prompt: trace.prompt,
      steps: parsed,
      outcome: trace.outcome,
    });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// small helper summarizer (tool-specific)
function summarizeOutput(tool: string | undefined, output: any) {
  if (!tool || !output) return null;
  if (tool === "vector_search") {
    const items = output.items ?? output;
    return items
      .slice(0, 3)
      .map((it: any) => ({
        id: it.id,
        score: it.score,
        snippet: it.metadata?.content?.slice?.(0, 200) ?? null,
      }));
  }
  if (tool === "web_search") {
    const results = output.results ?? output;
    return results.slice(0, 3).map((r: any) => ({ title: r.title, link: r.link }));
  }
  if (tool && tool.startsWith("calendar")) {
    return Array.isArray(output) ? output.slice(0, 3) : output;
  }
  return output;
}

export default router;
