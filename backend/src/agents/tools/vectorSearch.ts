import { vector } from "../../vector";
import { Tool, ToolInput, ToolResult } from "../../types/agent.js";
import Logger from "../../utils/logger";
import { LOGGER_TAGS } from "../../utils/tags";

interface IVectorSearchArgs extends ToolInput {
  query: string;
  topK?: number;
  filter?: Record<string, any>;
}

async function vectorSearch(args: IVectorSearchArgs): Promise<ToolResult> {
  try {
    const { query, topK = 5, filter } = args;
    Logger.log(LOGGER_TAGS.VECTOR_SEARCH_QUERY, query);

    const results = await vector.query({
      query,
      topK,
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

export const vectorSearchTool: Tool = {
  name: "vector_search",
  description: "Searches the vector for the given query and returns top matches",
  argsSchema: {
    query: { type: "string", description: "Search query text", required: true },
    topK: { type: "number", description: "Number of results to return", required: false },
  },
  execute: vectorSearch,
};
