import { LLMUsage } from "../llm/provider.types";
import { CitationSource } from "../vector/provider.types";

export type Tool<T> = {
  name: string;
  description: string;
  argsSchema: { [argName: string]: { type: string; description: string; required?: boolean } };
  execute: (args: T) => Promise<ToolResult> | ToolResult;
  additionalInfo?: () => string;
  isEnabled: () => boolean;
  getLoadingMessage: (args: T) => string;
};

export interface ToolInput {
  [k: string]: any;
}

export type ToolAction = {
  tool: string;
  input: ToolInput;
  id?: string;
};

export type ToolResult = {
  success: boolean;
  sources?: CitationSource[];
  output?: any;
  error?: string;
};

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

export type AgentResponse = {
  output: string;
  trace: any;
  usage: LLMUsage;
};
