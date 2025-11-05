import { CitationSource } from "../types/agent";
import { VectorResult } from "../vector/provider.types";

export const getCitationSourcesFromVectorResults = (
  results: VectorResult[],
  currentSourcesCount?: number
): CitationSource[] => {
  const sourceCitationMap = new Map<string, CitationSource>();
  let i = (currentSourcesCount ?? 0) + 1;
  results.forEach((result) => {
    const resultSource = (result.metadata?.source || "Unknown") as string;
    if (sourceCitationMap.has(resultSource)) {
      sourceCitationMap.get(resultSource)!.snippet += result.text;
    } else {
      sourceCitationMap.set(resultSource, {
        id: i,
        snippet: result.text,
        title: result.metadata?.source || "Unknown",
        url: result.metadata?.url,
      });
      i++;
    }
  });

  return [...sourceCitationMap.values()];
};
