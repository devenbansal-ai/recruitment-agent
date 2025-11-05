import { vector } from "../../vector";
import { Tool, ToolInput, ToolResult } from "../../types/agent.js";
import Logger from "../../utils/logger";
import { LOGGER_TAGS } from "../../utils/tags";
import {
  getCitationSourcesFromVectorResults,
  getContextFromCitationSources,
} from "../../utils/vector";
import { listDocuments } from "../../middleware/documentRegistry";

interface IVectorSearchArgs extends ToolInput {
  query: string;
  topK?: number;
  filter?: Record<string, any>;
}

async function vectorSearch(args: IVectorSearchArgs): Promise<ToolResult> {
  try {
    const { query, topK = 5, filter } = args;
    Logger.log(LOGGER_TAGS.VECTOR_SEARCH_QUERY, query);

    const vectorSearchResults = await vector.query({
      query,
      topK,
      filter: filter ?? undefined,
    });

    const sources = getCitationSourcesFromVectorResults(vectorSearchResults);
    const context = getContextFromCitationSources(sources);

    return { success: true, output: { query, context }, sources };
  } catch (err: any) {
    return { success: false, error: err?.message ?? String(err) };
  }
}

const sources = listDocuments();

export const vectorSearchTool: Tool<IVectorSearchArgs> = {
  name: "vector_search",
  description: "Searches the vector for the given query and returns top matches",
  argsSchema: {
    query: { type: "string", description: "Search query text", required: true },
    topK: { type: "number", description: "Number of results to return", required: false },
  },
  additionalInfo: () =>
    sources.length > 0
      ? `Sources available for reference: ${sources.map((source) => source.name).join(", ")}`
      : "",
  execute: vectorSearch,
  isEnabled: () => true,
  getLoadingMessage: (args) => `Searching the documents for ${args.query}...`,
};
