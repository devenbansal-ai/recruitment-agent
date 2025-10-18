import { TOOL_REGISTRY } from "./registry";
import { ToolAction, ToolResult } from "../types/agent";

/**
 * Basic action validator to prevent destructive commands.
 * Extend rules as needed.
 */
export function validateAction(action: ToolAction): { ok: boolean; reason?: string } {
  // disallow any action that attempts modification without explicit allow flag
  if (action.tool.startsWith("calendar") && action.tool.endsWith("write")) {
    // require explicit confirmation in input
    if (!action.input || !action.input.confirmed) {
      return { ok: false, reason: "Destructive calendar write blocked (missing confirmed flag)" };
    }
  }

  // For web_search and vector_search allow everything (read-only)
  return { ok: true };
}

export async function executeAction(action: ToolAction): Promise<ToolResult> {
  const validator = validateAction(action);
  if (!validator.ok) return { success: false, error: validator.reason };

  const fn = TOOL_REGISTRY[action.tool];
  if (!fn) return { success: false, error: `Tool not found: ${action.tool}` };

  try {
    const output = await fn(action.input ?? {});
    return { success: true, output };
  } catch (err: any) {
    return { success: false, error: err?.message ?? String(err) };
  }
}
