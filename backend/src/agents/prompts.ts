import { appStrings } from "../common/strings";
import { AgentStepItem, Tool } from "../types/agent";
import { InstructionsOptions } from "../types/prompt";
import { describeAllTools } from "./registry";

/**
 * Creates a prompt for the LLM to answer the user query
 * @param query User query
 * @param file Document file
 * @param steps Previous context
 * @returns Prompt for the LLM to answer the user query
 */
export function createPrompt(
  query: string,
  file?: string,
  steps?: AgentStepItem[],
  rules?: string
) {
  let prompt = `## User query:\n${query}`;

  if (file) {
    prompt += `\n\n## Document:\n${file}`;
  }

  if (steps?.length) {
    prompt += `\n\n## Previous context:\n${JSON.stringify(steps, null, 2)}`;
  }

  if (rules) {
    prompt += `\n\n## Rules:\n${rules}`;
  }

  return prompt;
}

export const appPrompts = {
  scenarios: `## Scenarios:

### Scenario 1: Find suitable job opportunities

When asked to find suitable job opportunities, you should:
1. Use vector_search to extract relevant skills, experience, and job roles from the resume.
2. Then, use web_search to find active job postings in India that match these skills.
3. Summarize top results with job titles and links.

### Scenario 2: Schedule an interview / test in the calendar:

When asked to schedule an interview / test in the calendar, you should:
1. Use calendar_search to find available slots in the calendar.
2. Then, use calendar_update to schedule the interview / test in the calendar.`,
  toolOrchestration: `## Decide the next action: one of the tools or ${appStrings.agentFinalAnswerActionName}

## Respond in JSON:
{ "action": "tool_name", "input": { "arg_1": "value_1", ... } | undefined } | { "action": "${appStrings.agentFinalAnswerActionName}", "answer": "..." }`,
  toolPlanner: `## Decide the series of actions to be taken to answer the user query, from the tools available or ${appStrings.agentFinalAnswerActionName}

## Respond in JSON:
{ "actions": [ "tool_name_1", "tool_name_2", ..., "${appStrings.agentFinalAnswerActionName}" ] }`,
  toolParameterPlanner: `## Decide the parameters for the tool to be used to answer the user query

## Respond in JSON:
{ "input": { "arg_1": "value_1", ... } }`,
  rules: `- In case of final answer, provide a well formatted markdown string as the answer.
- When asked to describe the tools available to you or your capabilities, respond with a single paragraph summarizing the tools' capabilities.
- In case of documents refered from vector search or results from a web search:
  Each retrieved document or search result is prefixed by a number in square brackets [1], [2], etc. When you write the final answer, cite sources inline using their numbers, like this: [1][3]. If multiple sources support the same fact, cite all of them.`,
};

/**
 * Creates instructions for the LLM to follow
 * @param prefix Prefix to add to the instructions
 * @param tools Tools available to the LLM
 * @returns Instructions for the LLM to follow
 */
export function createInstructions(prefix: string, tools: Tool[], options?: InstructionsOptions) {
  prefix = prefix.replace("{maxSteps}", options?.maxSteps?.toString() || "4");
  return `${prefix}\n\n## Tools:\n${describeAllTools(tools)}.`;
}

export const appInstructions = {
  planner: `You are a helpful planner, tasked to plan a series of actions (maximum of {maxSteps} actions) to answer the user query. You can use the following tools:`,
  plannerFinalAnswer: `The planner has decided to provide a final answer, post accessing the following tools available:`,
};
