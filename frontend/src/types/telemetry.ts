export type TelemetryData = {
  route: string;
  startTime: number;
  endTime?: number;
  latencyMs?: number;
  tokensIn?: number;
  tokensOut?: number;
  totalCostUsd?: number;
};
