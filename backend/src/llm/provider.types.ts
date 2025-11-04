import { ResponseTextConfig } from "openai/resources/responses/responses";
import { StreamMessage } from "../types/stream";
import { TelemetryData } from "../utils/telemetry";

export interface LLMResponse {
  text: string;
  usage?: LLMUsage;
}

export type LLMUsage = {
  input_tokens: number;
  output_tokens: number;
};

export interface StreamHandler {
  onData: (message: StreamMessage) => void;
  onEnd: (telemetry?: TelemetryData) => void;
  onError?: (err: Error) => void;
}

export type LLMResponseOptions = {
  model?: string;
  temperature?: number;
  instructions?: string;
  responseTextFormat?: ResponseTextConfig;
};

export interface LLMProvider {
  name: string;

  model: string;

  // One-shot completion
  generate(prompt: string, options?: LLMResponseOptions): Promise<LLMResponse>;

  // Streaming completion
  stream(prompt: string, handler: StreamHandler, options?: Record<string, any>): Promise<void>;

  // Create embedding
  createEmbedding(input: string, options?: Record<string, any>): Promise<number[]>;
}
