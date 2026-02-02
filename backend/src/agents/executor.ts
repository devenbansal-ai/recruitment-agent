import { ToolAction, ToolResult } from "../types/agent";
import { validateAction } from "./validator";
import { toolRegistry } from "./registry";

export async function executeAction(action: ToolAction): Promise<ToolResult> {
  const validator = validateAction(action);
  if (!validator.ok) return { success: false, error: validator.reason };

  const tool = toolRegistry.get(action.tool);
  if (!tool) return { success: false, error: `Tool not found: ${action.tool}` };

  try {
    const output = await tool.execute(action.input ?? {});
    if (output?.success === true || output?.success === false) return output;
    return { success: true, output };
  } catch (err: any) {
    return { success: false, error: err?.message ?? String(err) };
  }
}
