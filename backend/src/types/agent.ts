export type Tool = {
  name: string;
  description: string;
  argsSchema: { [argName: string]: { type: string; description: string; required?: boolean } };
  execute: (args: any) => Promise<ToolResult> | ToolResult;
  additionalInfo?: () => string;
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
};
