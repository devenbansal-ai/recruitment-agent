import { CitationSource } from "../vector/provider.types";

export type StreamMessage = {
  data: string;
  done?: boolean;
  isInterstitialMessage?: boolean;
  sources?: CitationSource[];
};
