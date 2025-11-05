import { TelemetryData } from "./telemetry";

export type CitationSource = {
  id: number;
  snippet: string;
  title: string;
  url?: string;
};

type BaseMessage = {
  id: string;
  role: string;
};

export type UserMessage = BaseMessage & {
  role: "user";
  content: string;
  file?: string;
};

export type AssistantMessage = BaseMessage & {
  role: "assistant";
  content: string;
  interstitialMessage?: string;
  sources?: CitationSource[];
  telemetry?: TelemetryData;
};

export type Message = UserMessage | AssistantMessage;
