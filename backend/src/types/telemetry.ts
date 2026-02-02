import { ToolAction, ToolResult } from "./agent";

export type AgentStep = {
  step: number;
  timestamp: string;
  action?: ToolAction;
  result?: ToolResult;
  note?: string;
};

export type AgentTrace = {
  requestId: string;
  prompt: string;
  startTime: string;
  endTime?: string;
  steps: AgentStep[];
  outcome?: string;
  meta?: Record<string, any>;
};