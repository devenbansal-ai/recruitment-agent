export interface LLMResponse {
  text: string;
  usage?: LLMUsage;
}

export type LLMUsage = {
  prompt_tokens: number;
  completion_tokens: number;
};

export interface StreamHandler {
  onData: (chunk: string) => void;
  onEnd: () => void;
  onError?: (err: Error) => void;
}

export interface LLMProvider {
  name: string;

  model: string;

  // One-shot completion
  generate(prompt: string, options?: Record<string, any>): Promise<LLMResponse>;

  // Streaming completion
  stream(prompt: string, handler: StreamHandler, options?: Record<string, any>): Promise<void>;

  // Create embedding
  createEmbedding(input: string, options?: Record<string, any>): Promise<number[]>;
}
