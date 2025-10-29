import express from "express";
import { webSearchTool } from "../agents/tools/webSearch";

const router = express.Router();

router.post("/", async (req, res) => {
  const { query } = req.body;
  const results = await webSearchTool.execute(query);
  res.json({ results });
});

export default router;
