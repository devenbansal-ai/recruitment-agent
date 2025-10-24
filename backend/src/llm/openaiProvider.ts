import OpenAI from "openai";
import { LLMProvider, LLMResponse, StreamHandler } from "./provider.types.js";

export class OpenAIProvider implements LLMProvider {
  name = "openai";
  private client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async generate(prompt: string, options?: { model?: string }): Promise<LLMResponse> {
    const model = options?.model || "gpt-4o-mini";

    const response = await this.client.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.choices[0]?.message?.content || "";
    const tokens = response.usage?.total_tokens;

    return { text, tokens };
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
