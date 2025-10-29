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
    const model = this.model;
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
    options?: { model?: string }
  ): Promise<void> {
    const model = options?.model || "gpt-4o-mini";

    const stream = await this.client.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      stream: true,
    });

    try {
      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content;
        if (delta) handler.onData(delta);
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
