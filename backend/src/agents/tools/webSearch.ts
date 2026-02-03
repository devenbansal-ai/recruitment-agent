import { getJson } from "serpapi";
import Logger from "../../utils/logger";
import { LOGGER_TAGS } from "../../utils/tags";
import { CitationSource, Tool, ToolInput, ToolResult } from "../../types/agent";
import { getContextFromCitationSources } from "../../utils/citations";

const apiKey = process.env.SERPAPI_KEY!;

interface IWebSearchArgs extends ToolInput {
  query: string;
  sources?: CitationSource[];
}

async function webSearch(args: IWebSearchArgs): Promise<ToolResult> {
  Logger.log(LOGGER_TAGS.WEB_SEARCH_QUERY, args.query);
  const params = {
    q: args.query,
    engine: "google",
    hl: "en",
    gl: "us",
  };

  try {
    const data = await new Promise<any>((resolve, reject) => {
      getJson(
        {
          ...params,
          google_domain: "google.com",
          num: "10",
          safe: "active",
          api_key: apiKey,
        },
        (json) => {
          Logger.log(LOGGER_TAGS.WEB_SEARCH_SUCCESSFUL);
          resolve(json);
        }
      );
    });

    const sources = getCitationSourcesFromOrganicResults(
      data["organic_results"] || [],
      args.sources?.length || 0
    );
    const context = getContextFromCitationSources(sources);

    return {
      success: true,
      output: context,
      sources,
    };
  } catch (err) {
    Logger.log(LOGGER_TAGS.WEB_SEARCH_UNSUCCESSFUL);
    return {
      success: false,
      error: String(err),
    };
  }
}

function getCitationSourcesFromOrganicResults(
  results: any[],
  currentSourcesCount?: number
): CitationSource[] {
  const sourceCitationMap = new Map<string, CitationSource>();
  let i = (currentSourcesCount ?? 0) + 1;
  results.forEach((result) => {
    const resultSource = (result.metadata?.link || "Unknown") as string;
    if (sourceCitationMap.has(resultSource)) {
      sourceCitationMap.get(resultSource)!.snippet += result.snippet;
    } else {
      sourceCitationMap.set(resultSource, {
        id: i,
        snippet: result.snippet,
        title: result.title || "Unknown",
        url: result.link,
      });
      i++;
    }
  });

  return [...sourceCitationMap.values()];
}

export const webSearchTool: Tool<IWebSearchArgs> = {
  name: "web_search",
  description: `Use this to search for recent information or job postings online.
    Input: { "query": "the search query string" }
    Output: relevant search results (title, snippet, link).`,
  argsSchema: {
    query: { type: "string", description: "The query to search the web for.", required: true },
  },
  execute: webSearch,
  isEnabled: () => true,
  getLoadingMessage: (args: IWebSearchArgs) => `Seaching the web for ${args.query}...`,
};
