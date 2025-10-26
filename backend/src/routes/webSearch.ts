import express from "express";
import { webSearch } from "../agents/tools/webSearch";

const router = express.Router();

router.post("/", async (req, res) => {
  const { query } = req.body;
  const results = await webSearch(query);
  res.json({ results });
});

export default router;
