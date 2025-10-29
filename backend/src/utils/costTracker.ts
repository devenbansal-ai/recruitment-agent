import { LLMUsage } from "../llm/provider.types";

type ModelCost = {
  input: number;
  output: number;
};

const modelRates: Record<string, ModelCost> = {
  "gpt-4o-mini": { input: 0.00015 / 1000, output: 0.0006 / 1000 },
  "gpt-4-turbo": { input: 0.01 / 1000, output: 0.03 / 1000 },
};

export function estimateCost(model: string, usage: LLMUsage) {
  const rate = modelRates[model];
  if (!rate || !usage) return 0;

  const inputCost = usage.input_tokens * rate.input;
  const outputCost = usage.output_tokens * rate.output;
  return inputCost + outputCost;
}
