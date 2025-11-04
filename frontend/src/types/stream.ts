import { TelemetryData } from "./chat";

export type StreamCallback = {
  onInterstitialMessage: (messageId: string, data: string) => void;
  onData: (messageId: string, data: string) => void;
  onDone: (messageId: string, telemetry?: TelemetryData) => void;
  onError: (messageId: string, error: any) => void;
};
