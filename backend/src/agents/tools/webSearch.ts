import { getJson } from "serpapi";

const apiKey = process.env.SERPAPI_API_KEY!;

export async function search({ q }: { q: string }) {
  const params = {
    q,
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
          resolve(json);
        }
      );
    });

    // You can transform data into your action-output format
    return {
      query: q,
      results:
        data["organic_results"].map((r: any) => ({
          title: r.title,
          link: r.link,
          snippet: r.snippet,
        })) ?? [],
    };
  } catch (err) {
    throw new Error(`WebSearch failed: ${String(err)}`);
  }
}
