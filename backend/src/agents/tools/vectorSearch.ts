import { vector } from "../../vector";

export async function search({ q, topK = 3 }: { q: string; topK?: number }) {
  // In real code: embed q and cosine search. This is a mock returning first topK vectors.
  const results = await vector.query(q, 3);
  return { query: q, results };
}
