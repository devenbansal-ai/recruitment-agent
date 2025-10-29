import { ToolAction } from "../types/agent";

export function ruleBasedPlanner(prompt: string): ToolAction[] {
  const actions: ToolAction[] = [];

  const p = prompt.toLowerCase();

  if (p.includes("find") && p.includes("web")) {
    actions.push({ tool: "web_search", input: { q: extractQuery(prompt) } });
  }

  if (p.includes("calendar") && p.includes("read")) {
    actions.push({ tool: "calendar_read", input: { range: "30d" } });
  }

  if (p.includes("source") || p.includes("doc")) {
    actions.push({ tool: "vector_search", input: { query: extractQuery(prompt), topK: 3 } });
  }

  // Fallback: ask the vector DB first for context
  if (!actions.length) {
    actions.push({ tool: "vector_search", input: { query: extractQuery(prompt), topK: 3 } });
  }

  return actions;
}

function extractQuery(prompt: string) {
  // simple heuristic: return after "about" or full prompt
  const m = prompt.match(/about (.+)/i);
  return m ? m[1] : prompt;
}
