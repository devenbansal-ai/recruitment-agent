import { vector } from "../src/vector";

(async () => {
  try {
    await vector.upsert([{ id: "1", text: "test document" }]);
    const result = await vector.query("test");
    if (!Array.isArray(result)) throw new Error("No array returned");
    console.log("✅ Vector wrapper OK");
  } catch (err) {
    console.error("❌ Vector wrapper failed:", err);
    process.exit(1);
  }
})();
