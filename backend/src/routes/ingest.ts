import express from "express";
import multer from "multer";
import { extractText } from "../utils/file";
import { chunkText } from "../embed/chunker";
import { vector } from "../vector";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.post("/", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("No file uploaded");

  const text = await extractText(file.path, file.mimetype);
  const chunks = chunkText(text);

  const vectors = chunks.map((e, i) => ({
    id: `${file.filename}_${i}`,
    text: e,
    metadata: { source: file.originalname, index: i },
  }));

  await vector.upsert(vectors);
  res.json({ status: "ok", chunks: chunks.length });
});

export default router;
