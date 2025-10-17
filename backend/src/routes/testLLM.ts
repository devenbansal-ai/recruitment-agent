import express from "express";
import { llm } from "../llm";

const router = express.Router();

router.get("/test-llm", async (req, res) => {
  try {
    const result = await llm.generate("Give me 3 interview tips for software engineers");
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "LLM test failed" });
  }
});

export default router;
