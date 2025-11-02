export type CitationSource = {
  id: number;
  snippet: string;
  title: string;
  url?: string;
};

export type UserMessage = {
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

export type AssistantMessage = {
  role: "assistant";
  content: string;
  sources?: CitationSource[];
  telemetry?: TelemetryData;
};

export type Message = UserMessage | AssistantMessage;
