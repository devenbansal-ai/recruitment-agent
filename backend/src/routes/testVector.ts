import express from "express";
import { vector } from "../vector";

const router = express.Router();

router.post("/test-vector", async (req, res) => {
  await vector.upsert([
    { id: "1", text: "JavaScript developer with frontend skills", metadata: { role: "frontend" } },
    { id: "2", text: "Python engineer experienced in backend APIs", metadata: { role: "backend" } },
  ]);

  const results = await vector.query({ query: "looking for backend engineer" });
  res.json(results);
});

export default router;
