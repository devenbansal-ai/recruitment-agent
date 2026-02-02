import fs from "fs";
import path from "path";
import { AgentTrace } from "../types/telemetry";

const TRACE_DIR = path.resolve(process.cwd(), "traces");
if (!fs.existsSync(TRACE_DIR)) fs.mkdirSync(TRACE_DIR, { recursive: true });

export function startTrace(requestId: string, prompt: string): AgentTrace {
  const t: AgentTrace = {
    requestId,
    prompt,
    startTime: new Date().toISOString(),
    steps: [],
  };
  return t;
}

export function appendStep(trace: AgentTrace, step: any) {
  trace.steps.push(step);
}

export function endAndPersistTrace(trace: AgentTrace) {
  trace.endTime = new Date().toISOString();
  const file = path.join(TRACE_DIR, `${trace.requestId}.json`);
  fs.writeFileSync(file, JSON.stringify(trace, null, 2), "utf-8");
}
