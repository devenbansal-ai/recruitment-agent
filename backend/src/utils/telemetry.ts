// src/utils/telemetry.ts
import { performance } from "perf_hooks";
import { estimateCost } from "./costTracker";
import { LLMUsage } from "../llm/provider.types";

export type TelemetryData = {
  route: string;
  startTime: number;
  endTime?: number;
  latencyMs?: number;
  tokensIn?: number;
  tokensOut?: number;
  totalCostUsd?: number;
};

export class Telemetry {
  private data: TelemetryData;

  constructor(route: string) {
    this.data = { route, startTime: performance.now() };
  }

  end(usage: LLMUsage, model = "gpt-4o-mini") {
    const endTime = performance.now();
    const latencyMs = endTime - this.data.startTime;

    const totalCostUsd = estimateCost(model, usage);

    this.data = {
      ...this.data,
      endTime,
      latencyMs,
      tokensIn: usage.input_tokens,
      tokensOut: usage.output_tokens,
      totalCostUsd,
    };

    console.log(`[TELEMETRY]`, JSON.stringify(this.data, null, 2));

    return this.data;
  }
}
