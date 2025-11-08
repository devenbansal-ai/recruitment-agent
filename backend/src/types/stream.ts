import { CitationSource } from "./agent";

export type StreamMessage = {
  data: string;
  done?: boolean;
  isInterstitialMessage?: boolean;
  sources?: CitationSource[];
};
