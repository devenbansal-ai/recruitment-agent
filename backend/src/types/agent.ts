import { LLMUsage } from "../llm/provider.types";

export interface CitationSource {
  id: number;
  title: string;
  url?: string;
  snippet: string;
}

export type Tool<T> = {
  name: string;
  description: string;
  argsSchema?: { [argName: string]: { type: string; description: string; required?: boolean } };
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

export type AgentResponse = {
  trace: AgentStepItem[];
  usage: LLMUsage;
};

export type AgentStepItem = ToolResult & {
  step: number;
  tool: string;
  input: ToolInput;
};

export type AgentContext = {
  steps: AgentStepItem[];
};

export type AgentAction = {
  action: string;
  input: ToolInput;
  answer?: string;
  is_last_tool?: boolean;
};
