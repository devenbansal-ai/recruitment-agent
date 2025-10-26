import express from "express";
import { getPineconeIndexes } from "../services/vectorStore";

const router = express.Router();

router.get("/pinecone-indexes", async (req, res) => {
  const pineconeIndexes = await getPineconeIndexes();
  res.json({ indexes: pineconeIndexes });
});

export default router;
