import { llm } from "../llm";
import { AgentResponse, CitationSource } from "../types/agent";
import { decribeTool, describeAllTools, toolRegistry, validateArgs } from "./registry";
import { startTrace, appendStep, endAndPersistTrace } from "../utils/traceLogger";
import { v4 as uuidv4 } from "uuid";
import { LLMUsage, StreamHandler } from "../llm/provider.types";

export async function runAgent(
  userQuery: string,
  streamHandler: StreamHandler,
  file?: string,
  maxSteps = 5
): Promise<AgentResponse> {
  let context = [];
  const sources: CitationSource[] = [];
  let finalAnswer = null;
  const requestId = uuidv4();
  const trace = startTrace(requestId, userQuery);
  const usage: LLMUsage = { input_tokens: 0, output_tokens: 0 };

  for (let step = 0; step < maxSteps; step++) {
    const prompt = `
## User query: 
${userQuery}${file ? `, refer the document: ${file}` : ""}

${
  context.length
    ? `## Previous context: ${JSON.stringify(context, null, 2)}
`
    : ""
}

## Decide the next action: one of the tools or final_answer

## Scenarios:
When asked to find suitable job opportunities, you should:
1. Use vector_search to extract relevant skills, experience, and job roles from the resume.
2. Then, use web_search to find active job postings in India that match these skills.
3. Summarize top results with job titles and links.

## Respond in JSON:
{ "action": "tool_name", "input": { "arg_1": "value_1", ... } | undefined } | { "action": "final_answer", "answer": "..." }

## Rules
- In case of action being final_answer, provide a well formatted markdown string as the answer.
- In case of documents refered from vector search or results from a web search:
  Each retrieved document or search result is prefixed by a number in square brackets [1], [2], etc. When you write the final answer, cite sources inline using their numbers, like this: [1][3]. If multiple sources support the same fact, cite all of them.
`;

    const instructions = `You are a reasoning agent. You can use these tools:\n${describeAllTools(toolRegistry.tools)}`;

    let decision;

    try {
      const response = await llm.generate(prompt, {
        temperature: 0.2,
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

      decision = JSON.parse(response.text);

      if (decision.action === "final_answer") {
        finalAnswer = decision.answer;
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

      context.push({
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

  const sortedSources = sources.sort((s_1, s_2) => s_1.id - s_2.id);
  streamHandler.onData({ data: finalAnswer, isInterstitialMessage: false, sources: sortedSources });

  trace.outcome = finalAnswer;
  endAndPersistTrace(trace);
  return { output: finalAnswer, trace: context, usage };
}
