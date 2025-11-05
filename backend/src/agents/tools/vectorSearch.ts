import { vector } from "../../vector";
import { CitationSource, Tool, ToolInput, ToolResult } from "../../types/agent.js";
import Logger from "../../utils/logger";
import { LOGGER_TAGS } from "../../utils/tags";
import { getCitationSourcesFromVectorResults } from "../../utils/vector";
import { listDocuments } from "../../middleware/documentRegistry";
import { getContextFromCitationSources } from "../../utils/citations";

interface IVectorSearchArgs extends ToolInput {
  query: string;
  topK?: number;
  filter?: Record<string, any>;
  sources?: CitationSource[];
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

    const sources = getCitationSourcesFromVectorResults(
      vectorSearchResults,
      args.sources?.length || 0
    );
    const context = getContextFromCitationSources(sources);

    return { success: true, output: context, sources };
  } catch (err: any) {
    return { success: false, error: err?.message ?? String(err) };
  }
}

const sources = listDocuments();

export const vectorSearchTool: Tool<IVectorSearchArgs> = {
  name: "vector_search",
  description: `Use this to retrieve information from uploaded documents such as resumes.
    Input: { "query": "string describing what you want to know" }
    Output: relevant text snippets from the document.`,
  argsSchema: {
    query: { type: "string", description: "Search query text", required: true },
    topK: { type: "number", description: "Number of results to return", required: false },
  },
  additionalInfo:
    sources.length > 0
      ? () => `Sources available for reference: ${sources.map((source) => source.name).join(", ")}`
      : undefined,
  execute: vectorSearch,
  isEnabled: () => true,
  getLoadingMessage: (args) => `Searching the documents for ${args.query}...`,
};
