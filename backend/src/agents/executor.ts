import { ToolAction, ToolResult } from "../types/agent";
import { toolRegistry } from "./registry";

/**
 * Basic action validator to prevent destructive commands.
 * Extend rules as needed.
 */
export function validateAction(action: ToolAction): { ok: boolean; reason?: string } {
  if (!action || !action.tool) return { ok: false, reason: "Bad action" };

  // Block destructive calendar writes unless confirmed
  if (action.tool === "calendar_write") {
    if (!action.input?.confirmed) {
      return { ok: false, reason: "calendar_write is blocked: missing confirmed flag" };
    }
  }

  // Disallow unknown tools
  if (!toolRegistry.has(action.tool)) {
    return { ok: false, reason: `Tool not found: ${action.tool}` };
  }

  return { ok: true };
}

export async function executeAction(action: ToolAction): Promise<ToolResult> {
  const validator = validateAction(action);
  if (!validator.ok) return { success: false, error: validator.reason };

  const fn = toolRegistry.get(action.tool);
  if (!fn) return { success: false, error: `Tool not found: ${action.tool}` };

  try {
    const output = await fn.execute(action.input ?? {});
    if (output?.success === true || output?.success === false) return output;
    return { success: true, output };
  } catch (err: any) {
    return { success: false, error: err?.message ?? String(err) };
  }
}
