import { CitationSource } from "./chat";
import { TelemetryData } from "./telemetry";

export type StreamCallback = {
  onInterstitialMessage: (messageId: string, data: string) => void;
  onData: (messageId: string, data: string, sources: CitationSource[]) => void;
  onDone: (messageId: string, telemetry?: TelemetryData) => void;
  onError: (messageId: string, error: any) => void;
};
