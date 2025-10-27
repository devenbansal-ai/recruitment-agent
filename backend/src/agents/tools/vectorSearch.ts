import { vector } from "../../vector";
import { ToolResult } from "../../types/agent.js";
import Logger from "../../utils/logger";
import { LOGGER_TAGS } from "../../utils/tags";

export type VectorSearchInput = {
  query: string;
  topK?: number;
  filter?: Record<string, any>;
};

export async function search(input: VectorSearchInput): Promise<ToolResult> {
  try {
    const { query, topK = 5, filter } = input;
    Logger.log(LOGGER_TAGS.VECTOR_SEARCH_QUERY, query);

    const results = await vector.query({
      query,
      topK,
      includeMetadata: true,
      filter: filter ?? undefined,
    });

    const items = results.map((result) => ({
      id: result.id,
      score: result.score,
      metadata: result.metadata,
      snippet: result.text,
    }));

    return { success: true, output: { query, items } };
  } catch (err: any) {
    return { success: false, error: err?.message ?? String(err) };
  }
}
