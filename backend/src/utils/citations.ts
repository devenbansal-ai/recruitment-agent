import { CitationSource } from "../types/agent";

export const getContextFromCitationSources = (sources: CitationSource[]): string => {
  return sources
    .map(
      (source, i) =>
        `[${i + 1}] ${source.snippet}\n(Source: ${source.url || source.title || "Unknown"})`
    )
    .join("\n\n");
};
