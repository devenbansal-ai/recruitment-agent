import express from "express";
import { getVectorProvider } from "../vector";

const router = express.Router();

router.post("/test-vector", async (req, res) => {
  const vector = getVectorProvider("chroma");
  console.log("vector: ", vector);
  await vector.upsert([
    { id: "1", text: "JavaScript developer with frontend skills", metadata: { role: "frontend" } },
    { id: "2", text: "Python engineer experienced in backend APIs", metadata: { role: "backend" } },
  ]);
  console.log("here 1");

  const results = await vector.query("looking for backend engineer");
  console.log("here 2");
  console.log("results: ", results);
  res.json(results);
});

export default router;
