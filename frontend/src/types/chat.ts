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
};

export type TelemetryData = {
  route: string;
  startTime: number;
  endTime?: number;
  latencyMs?: number;
  tokensIn?: number;
  tokensOut?: number;
  totalCostUsd?: number;
};

export type AssistantMessage = BaseMessage & {
  role: "assistant";
  content: string;
  interstitialMessage?: string;
  sources?: CitationSource[];
  telemetry?: TelemetryData;
};

export type Message = UserMessage | AssistantMessage;
