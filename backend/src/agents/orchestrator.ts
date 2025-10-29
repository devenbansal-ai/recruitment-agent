import { llm } from "../llm";
import { AgentResponse } from "../types/agent";
import { toolRegistry, validateArgs } from "./registry";
import { startTrace, appendStep, endAndPersistTrace } from "../utils/traceLogger";
import { v4 as uuidv4 } from "uuid";

export async function runAgent(userQuery: string, maxSteps = 5): Promise<AgentResponse> {
  let context = [];
  let finalAnswer = null;
  const requestId = uuidv4();
  const trace = startTrace(requestId, userQuery);

  for (let step = 0; step < maxSteps; step++) {
    const prompt = `User query: ${userQuery}
${context.length ? `Previous context: ${JSON.stringify(context, null, 2)}` : ""}

Decide next action:
Respond in JSON:
{ "action": "tool_name" | "final_answer", "input": { "arg_1": "value_1", ... } | undefined }`;

    const instructions = `You are a reasoning agent. You can use these tools:\n${toolRegistry.describeAll()}`;

    let decision;

    try {
      const response = await llm.generate(prompt, {
        temperature: 0.2,
        responseTextFormat: { format: { type: "json_object" } },
        instructions,
      });

      const agentStep = {
        step: step + 1,
        timestamp: new Date().toISOString(),
        response,
      };
      appendStep(trace, agentStep);

      decision = JSON.parse(response.text);

      if (decision.action === "final_answer") {
        finalAnswer = decision.input;
        break;
      }

      const tool = toolRegistry.get(decision.action);
      if (!tool) {
        throw new Error(`Agent recommended tool (${decision.action}) which wasn't found`);
      }

      const args = decision.input;
      validateArgs(tool, args);

      const toolResult = await tool.execute(args);

      const stepResult = {
        step: step + 1,
        timestamp: new Date().toISOString(),
        toolResult,
      };
      appendStep(trace, stepResult);

      if (!toolResult.success) {
        throw new Error(`Tool ${tool.name} failed with error: ${toolResult.error}`);
      }

      context.push({
        tool: decision.action,
        input: decision.input,
        toolResult,
      });
    } catch (err) {
      appendStep(trace, {
        step: -1,
        timestamp: new Date().toISOString(),
        note: "fatal_error",
        decision,
        result: { success: false, error: String(err) },
      });
      endAndPersistTrace(trace);
      throw err;
    }
  }

  trace.outcome = finalAnswer;
  endAndPersistTrace(trace);
  return { output: finalAnswer, trace: context };
}
