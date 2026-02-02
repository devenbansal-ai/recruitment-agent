import { webSearchTool } from "./tools/webSearch";
import { vectorSearchTool } from "./tools/vectorSearch";
import { Tool } from "../types/agent";
import { calendarListEventsTool } from "./tools/calendarListEvents";
import { calendarCreateEventTool } from "./tools/calendarCreateEvent";

export const TOOLS = [
  webSearchTool,
  calendarListEventsTool,
  calendarCreateEventTool,
  vectorSearchTool,
];

const disabled = process.env.DISABLED_TOOLS?.split(",") ?? [];
export const ENABLED_TOOLS = TOOLS.filter(
  (tool) => tool.isEnabled() && !disabled.includes(tool.name)
);

type ToolRegistry = {
  tools: Tool<any>[];
  has: (name: string) => boolean;
  get: (name: string) => Tool<any> | undefined;
};

export const toolRegistry: ToolRegistry = {
  tools: ENABLED_TOOLS,
  has(name) {
    return this.tools.some((tool) => tool.name === name && tool.isEnabled());
  },
  get(name) {
    return this.tools.find((tool) => tool.name === name && tool.isEnabled());
  },
};

function getArgumentsDescription(argsSchema?: {
  [argName: string]: { type: string; description: string; required?: boolean };
}): string {
  if (!argsSchema) return "";
  const argList = Object.entries(argsSchema)
    .map(
      ([key, info]) =>
        `- ${key} (${info.type})${info.required ? " [required]" : ""}: ${info.description}`
    )
    .join("\n");

  return `####Arguments:\n${argList}`;
}

export function decribeTool(tool: Tool<any>): string {
  return `### ${tool.name}
#### Description: ${tool.description}
${getArgumentsDescription(tool.argsSchema)}
${tool.additionalInfo ? `#### Additional info: ${tool.additionalInfo()}` : ""}`;
}

export function describeAllTools(tools: Tool<any>[]): string {
  const toolsDescription = tools.map(decribeTool).join("\n\n");

  return toolsDescription;
}

export function validateArgs(tool: Tool<any>, args: any) {
  for (const [key, info] of Object.entries(tool.argsSchema || {})) {
    if (info.required && !(key in args)) throw new Error(`Missing required arg: ${key}`);
  }
}
