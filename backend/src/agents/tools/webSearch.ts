import { getJson } from "serpapi";
import Logger from "../../utils/logger";
import { LOGGER_TAGS } from "../../utils/tags";
import { Tool, ToolInput, ToolResult } from "../../types/agent";

const apiKey = process.env.SERPAPI_KEY!;

interface IWebSearchArgs extends ToolInput {
  query: string;
}

async function webSearch(args: IWebSearchArgs): Promise<ToolResult> {
  Logger.log(LOGGER_TAGS.WEB_SEARCH_QUERY, args.query);
  const params = {
    q: args.query,
    engine: "google", // or whichever engine you choose
    hl: "en",
    gl: "us",
    // you can add more parameters
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

    // You can transform data into your action-output format
    return {
      success: true,
      output:
        data["organic_results"].map((r: any) => ({
          title: r.title,
          link: r.link,
          snippet: r.snippet,
        })) ?? [],
    };
  } catch (err) {
    Logger.log(LOGGER_TAGS.WEB_SEARCH_UNSUCCESSFUL);
    return {
      success: false,
      error: String(err),
    };
  }
}

export const webSearchTool: Tool<IWebSearchArgs> = {
  name: "web_search",
  description: "Searches the web for the given query and returns top matches",
  argsSchema: {
    query: { type: "string", description: "The query to search the web for.", required: true },
  },
  execute: webSearch,
  isEnabled: () => true,
  getLoadingMessage: (args: IWebSearchArgs) => `Seaching the web for ${args.query}...`,
};
