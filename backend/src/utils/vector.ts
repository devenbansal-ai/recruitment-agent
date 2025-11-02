import { CitationSource, VectorResult } from "../vector/provider.types";

export const getContextFromVectorResults = (results: VectorResult[]): string => {
  return results
    .map(
      (result, i) => `[${i + 1}] ${result.text}\n(Source: ${result.metadata?.source || "Unknown"})`
    )
    .join("\n\n");
};

export const getCitationSourcesFromVectorResults = (results: VectorResult[]): CitationSource[] => {
  return results.map((result, i) => {
    return {
      id: i + 1,
      snippet: result.text.slice(0, 300),
      title: result.metadata?.source || "Unknown",
      url: result.metadata?.url,
    } as CitationSource;
  });
};
