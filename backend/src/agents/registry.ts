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

type ToolRegistry = {
  tools: Tool[];
  getEnabledTools: () => Tool[];
  describeAll: () => string;
  has: (name: string) => boolean;
  get: (name: string) => Tool | undefined;
};

export const toolRegistry: ToolRegistry = {
  tools: TOOLS,
  getEnabledTools() {
    return this.tools.filter((tool) => tool.isEnabled());
  },
  has(name) {
    return this.getEnabledTools().some((tool) => tool.name === name && tool.isEnabled());
  },
  get(name) {
    return this.getEnabledTools().find((tool) => tool.name === name && tool.isEnabled());
  },
  describeAll() {
    return this.getEnabledTools()
      .map((tool) => {
        const argList = Object.entries(tool.argsSchema)
          .map(
            ([key, info]) =>
              `- ${key} (${info.type})${info.required ? " [required]" : ""}: ${info.description}`
          )
          .join("\n");

        return `### ${tool.name}
Description: ${tool.description}
Arguments:
${argList ? argList : "None"}
${tool.additionalInfo ? `Additional info: ${tool.additionalInfo()}` : ""}`;
      })
      .join("\n\n");
  },
};

export function validateArgs(tool: Tool, args: any) {
  for (const [key, info] of Object.entries(tool.argsSchema)) {
    if (info.required && !(key in args)) throw new Error(`Missing required arg: ${key}`);
  }
}
