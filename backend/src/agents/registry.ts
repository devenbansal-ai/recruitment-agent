import * as webSearch from "./tools/webSearch";
import * as calendar from "./tools/calendar";
import * as vectorSearch from "./tools/vectorSearch";

type ToolFn = (input: any) => Promise<any>;

export const TOOL_REGISTRY: Record<string, ToolFn> = {
  web_search: webSearch.webSearch,
  calendar_read: calendar.read,
  calendar_write: calendar.write,
  vector_search: vectorSearch.search,
};
