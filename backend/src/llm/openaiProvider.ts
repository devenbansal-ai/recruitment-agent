import OpenAI from "openai";
import {
  LLMProvider,
  LLMResponse,
  StreamHandler,
  LLMUsage,
  LLMResponseOptions,
} from "./provider.types";

export class OpenAIProvider implements LLMProvider {
  name = "openai";
  model = "gpt-4o-mini";
  private client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async generate(prompt: string, options?: LLMResponseOptions): Promise<LLMResponse> {
    const model = options?.model || this.model;
    const response = await this.client.responses.create({
      input: prompt,
      model,
      instructions: options?.instructions,
      text: options?.responseTextFormat,
      temperature: options?.temperature,
    });

    const text = response.output_text || "";
    let usage: LLMUsage | undefined;
    if (response.usage?.input_tokens && response.usage?.output_tokens) {
      usage = {
        input_tokens: response.usage?.input_tokens,
        output_tokens: response.usage?.output_tokens,
      } as LLMUsage;
    }
    return { text, usage };
  }

  async stream(
    prompt: string,
    handler: StreamHandler,
    options?: LLMResponseOptions
  ): Promise<void> {
    const model = options?.model || this.model;

    const stream = await this.client.responses.create({
      input: prompt,
      model,
      instructions: options?.instructions,
      text: options?.responseTextFormat,
      temperature: options?.temperature,
      stream: true,
    });

    try {
      for await (const event of stream) {
        // Each event has an `event` type and `data`
        // We focus on text delta events
        if (event.type === "response.output_text.delta") {
          const deltaText = event.delta;
          if (deltaText) {
            handler.onData({ data: deltaText, isInterstitialMessage: false });
          }
        }
      }
      handler.onEnd();
    } catch (err) {
      if (handler.onError) handler.onError(err as Error);
    }
  }

  async createEmbedding(input: string, options?: { model?: string }): Promise<number[]> {
    const model = options?.model ?? "text-embedding-3-small";
    const res = await this.client.embeddings.create({
      model,
      input,
    });
    return res.data[0].embedding;
  }
}
