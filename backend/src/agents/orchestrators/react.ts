import { llm } from "../../llm";
import { AgentAction, AgentContext, AgentResponse, CitationSource } from "../../types/agent";
import { decribeTool, toolRegistry, validateArgs } from "../registry";
import { startTrace, appendStep, endAndPersistTrace } from "../../utils/traceLogger";
import { v4 as uuidv4 } from "uuid";
import { LLMUsage, StreamHandler } from "../../llm/provider.types";
import { appPrompts, createInstructions, createPrompt } from "../prompts";
import { appStrings } from "../../common/strings";

export async function runReActAgent(
  userQuery: string,
  streamHandler: StreamHandler,
  file?: string,
  maxSteps = 5
): Promise<AgentResponse> {
  const agentContext: AgentContext = { steps: [] };
  const sources: CitationSource[] = [];
  let finalAnswer: string | null = null;
  const requestId = uuidv4();
  const trace = startTrace(requestId, userQuery);
  const usage: LLMUsage = { input_tokens: 0, output_tokens: 0 };

  for (let step = 0; step < maxSteps; step++) {
    let prompt = createPrompt(userQuery, file, agentContext.steps, appPrompts.rules);
    prompt += `\n\n${appPrompts.toolOrchestration}`;

    const instructions = createInstructions(
      `You are a reasoning agent. You can use these tools:`,
      toolRegistry.tools
    );

    let decision;

    try {
      const response = await llm.generate(prompt, {
        temperature: 0.1,
        responseTextFormat: { format: { type: "json_object" } },
        instructions,
      });

      if (response.usage) {
        usage.input_tokens += response.usage.input_tokens;
        usage.output_tokens += response.usage.output_tokens;
      }

      const agentStep = {
        step: step + 1,
        timestamp: new Date().toISOString(),
        response,
      };
      appendStep(trace, agentStep);

      decision = JSON.parse(response.text) as AgentAction;

      if (decision.action === appStrings.agentFinalAnswerActionName) {
        if (!decision.answer) {
          throw new Error("Agent provided final answer action without an answer");
        }
        finalAnswer = decision.answer as string;
        break;
      }

      const tool = toolRegistry.get(decision.action);
      if (!tool) {
        throw new Error(`Agent recommended tool (${decision.action}) which wasn't found`);
      }

      const args = decision.input;
      validateArgs(tool, args);

      streamHandler.onData({ data: tool.getLoadingMessage(args), isInterstitialMessage: true });

      const toolResult = await tool.execute({ ...args, sources });

      const toolSources = toolResult.sources || [];
      sources.push(...toolSources);

      const stepResult = {
        step: step + 1,
        timestamp: new Date().toISOString(),
        toolDescription: decribeTool(tool),
        toolResult,
      };
      appendStep(trace, stepResult);

      if (!toolResult.success) {
        throw new Error(`Tool ${tool.name} failed with error: ${toolResult.error}`);
      }

      agentContext.steps.push({
        step: step + 1,
        tool: decision.action,
        input: decision.input,
        ...toolResult,
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

  if (!finalAnswer) {
    throw new Error("Agent did not provide a final answer");
  }

  const sortedSources = sources.sort((s_1, s_2) => s_1.id - s_2.id);
  streamHandler.onData({ data: finalAnswer, isInterstitialMessage: false });
  streamHandler.onSources(sortedSources);

  trace.outcome = finalAnswer;
  endAndPersistTrace(trace);
  return { trace: agentContext.steps, usage };
}
