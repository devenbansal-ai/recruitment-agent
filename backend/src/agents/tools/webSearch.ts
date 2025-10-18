export async function search({ q }: { q: string }) {
  // very small mocked result
  return {
    engine: "mock-web",
    query: q,
    results: [
      { title: "Mock result 1", url: "https://example.com/1", snippet: "Snippet 1 about " + q },
      { title: "Mock result 2", url: "https://example.com/2", snippet: "Snippet 2 about " + q },
    ],
  };
}
