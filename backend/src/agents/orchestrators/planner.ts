import { llm } from "../../llm";
import { AgentContext, AgentResponse, CitationSource, ToolInput } from "../../types/agent";
import { decribeTool, toolRegistry, validateArgs } from "../registry";
import { startTrace, appendStep, endAndPersistTrace } from "../../utils/traceLogger";
import { v4 as uuidv4 } from "uuid";
import { LLMUsage, StreamHandler } from "../../llm/provider.types";
import { appInstructions, appPrompts, createInstructions, createPrompt } from "../prompts";
import { appStrings } from "../../common/strings";
import Logger from "../../utils/logger";

async function createPlan(
  userQuery: string,
  maxSteps: number,
  file?: string
): Promise<{ actions: string[]; usage: LLMUsage | undefined }> {
  let prompt = createPrompt(userQuery, file);

  const instructions = createInstructions(appInstructions.planner, toolRegistry.tools, {
    maxSteps,
  });

  prompt += `\n\n${appPrompts.toolPlanner}`;
  prompt += `\n\n${appPrompts.rules}`;

  const response = await llm.generate(prompt, {
    temperature: 0.1,
    responseTextFormat: { format: { type: "json_object" } },
    instructions,
  });

  const plan = JSON.parse(response.text);
  if ("actions" in plan) {
    return { actions: plan.actions, usage: response.usage };
  } else {
    throw new Error("Plan does not contain actions");
  }
}

export async function runPlannerAgent(
  userQuery: string,
  streamHandler: StreamHandler,
  file?: string,
  maxSteps = 5
): Promise<AgentResponse> {
  let agentContext: AgentContext = { steps: [] };
  const sources: CitationSource[] = [];
  const requestId = uuidv4();
  const trace = startTrace(requestId, userQuery);
  const usage: LLMUsage = { input_tokens: 0, output_tokens: 0 };

  let actions: string[] = [];
  try {
    try {
      const planResult = await createPlan(userQuery, maxSteps, file);
      actions = planResult.actions;
      if (planResult.usage) {
        usage.input_tokens += planResult.usage.input_tokens;
        usage.output_tokens += planResult.usage.output_tokens;
      }
    } catch (error) {
      appendStep(trace, {
        step: -1,
        timestamp: new Date().toISOString(),
        note: "planner_error",
        result: { success: false, error: String(error) },
      });
      endAndPersistTrace(trace);
      throw new Error(String(error));
    }

    let stepCount = 0;
    for (const action of actions) {
      stepCount++;
      if (action === appStrings.agentFinalAnswerActionName) {
        const prompt = createPrompt(userQuery, file, agentContext.steps, appPrompts.rules);
        const instructions = createInstructions(
          appInstructions.plannerFinalAnswer,
          toolRegistry.tools
        );
        await llm.stream(prompt, streamHandler, { instructions });
        const sortedSources = sources.sort((s_1, s_2) => s_1.id - s_2.id);
        streamHandler.onSources(sortedSources);
        endAndPersistTrace(trace);
        break;
      }
      const tool = toolRegistry.get(action);
      if (tool) {
        let args = {};
        if (tool.argsSchema) {
          let prompt = createPrompt(userQuery, file, agentContext.steps, appPrompts.rules);
          prompt += `\n\n${appPrompts.toolOrchestration}`;
          const instructions = `As part of the plan, you are asked to provide the arguments for the following tool: ${decribeTool(tool)}`;
          const response = await llm.generate(prompt, {
            temperature: 0.1,
            responseTextFormat: { format: { type: "json_object" } },
            instructions,
          });

          if (response.usage) {
            usage.input_tokens += response.usage.input_tokens;
            usage.output_tokens += response.usage.output_tokens;
          }
          const toolInput = JSON.parse(response.text);
          if ("input" in toolInput) {
            args = toolInput.input as ToolInput;
          }
        }

        validateArgs(tool, args);
        streamHandler.onData({
          data: tool.getLoadingMessage(args),
          isInterstitialMessage: true,
          done: false,
        });
        const toolResult = await tool.execute({ ...args, sources });

        const toolSources = toolResult.sources || [];
        sources.push(...toolSources);

        const stepResult = {
          step: stepCount,
          timestamp: new Date().toISOString(),
          toolDescription: decribeTool(tool),
          toolResult,
        };
        appendStep(trace, stepResult);

        if (!toolResult.success) {
          throw new Error(`Tool ${tool.name} failed with error: ${toolResult.error}`);
        }

        agentContext.steps.push({
          step: stepCount,
          tool: action,
          input: args,
          ...toolResult,
        });
      } else {
        throw new Error(`Action ${action} not found`);
      }
    }
  } catch (error) {
    Logger.log("Error in orchestrator: " + String(error));
  }

  return { trace: agentContext.steps, usage };
}
