import pLimit from "p-limit";

export const limit = pLimit(5); // max 5 concurrent LLM calls
