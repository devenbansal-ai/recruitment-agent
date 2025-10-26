import { getJson } from "serpapi";
import Logger from "../../utils/logger";
import { LOGGER_TAGS } from "../../utils/tags";

const apiKey = process.env.SERPAPI_KEY!;

export async function webSearch(query: string) {
  Logger.log(LOGGER_TAGS.WEB_SEARCH_QUERY, query);
  const params = {
    q: query,
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
      query,
      results:
        data["organic_results"].map((r: any) => ({
          title: r.title,
          link: r.link,
          snippet: r.snippet,
        })) ?? [],
    };
  } catch (err) {
    Logger.log(LOGGER_TAGS.WEB_SEARCH_UNSUCCESSFUL);
    throw new Error(`WebSearch failed: ${String(err)}`);
  }
}
