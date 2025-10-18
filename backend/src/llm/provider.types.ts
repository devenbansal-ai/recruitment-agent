export interface LLMResponse {
  text: string;
  tokens?: number;
}

export interface StreamHandler {
  onData: (chunk: string) => void;
  onEnd: () => void;
  onError?: (err: Error) => void;
}

export interface LLMProvider {
  name: string;

  // One-shot completion
  generate(prompt: string, options?: Record<string, any>): Promise<LLMResponse>;

  // Streaming completion
  stream(prompt: string, handler: StreamHandler, options?: Record<string, any>): Promise<void>;

  // Create embedding
  createEmbedding(input: string, options?: Record<string, any>): Promise<number[]>;
}
