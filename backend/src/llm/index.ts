import { LLMProvider } from "./provider.types";
import { OpenAIProvider } from "./openaiProvider";

const providers: Record<string, LLMProvider> = {
  openai: new OpenAIProvider(),
};

const getLLMProvider = (name: string): LLMProvider => {
  const provider = providers[name];
  if (!provider) throw new Error(`LLM provider ${name} not found`);
  return provider;
};

const activeProvider = process.env.LLM_PROVIDER || "openai";
export const llm = getLLMProvider(activeProvider);
