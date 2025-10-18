import { llm } from "../llm";

(async () => {
  try {
    const result = await llm.generate("Return the word: OK");
    if (!result.text.includes("OK")) throw new Error("Unexpected response");
    console.log("✅ LLM wrapper OK");
  } catch (err) {
    console.error("❌ LLM wrapper failed:", err);
    process.exit(1);
  }
})();
