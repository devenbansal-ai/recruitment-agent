import NodeCache from "node-cache";

export const llmCache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

export function getCachedLLMResponse(key: string) {
  return llmCache.get(key);
}

export function setCachedLLMResponse(key: string, value: any) {
  llmCache.set(key, value);
}
