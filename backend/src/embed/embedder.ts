import { llm } from "../llm";

export async function embedChunks(chunks: string[]): Promise<number[][]> {
  const embeddings = await Promise.all(
    chunks.map(async (chunk) => {
      const res = await llm.createEmbedding(chunk);
      return res;
    })
  );
  return embeddings;
}
