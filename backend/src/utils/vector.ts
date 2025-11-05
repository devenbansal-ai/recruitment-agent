import { CitationSource, VectorResult } from "../vector/provider.types";

export const getContextFromCitationSources = (sources: CitationSource[]): string => {
  return sources
    .map(
      (source, i) =>
        `[${i + 1}] ${source.snippet}\n(Source: ${source.url || source.title || "Unknown"})`
    )
    .join("\n\n");
};

export const getCitationSourcesFromVectorResults = (results: VectorResult[]): CitationSource[] => {
  const sourceCitationMap = new Map<string, CitationSource>();
  let i = 0;
  results.forEach((result) => {
    const resultSource = (result.metadata?.source || "Unknown") as string;
    if (sourceCitationMap.has(resultSource)) {
      sourceCitationMap.get(resultSource)!.snippet += result.text;
    } else {
      sourceCitationMap.set(resultSource, {
        id: i + 1,
        snippet: result.text,
        title: result.metadata?.source || "Unknown",
        url: result.metadata?.url,
      });
      i++;
    }
  });

  return [...sourceCitationMap.values()];
};
