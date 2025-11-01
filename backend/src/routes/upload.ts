import express from "express";
import multer from "multer";
import { extractText } from "../utils/file";
import { vector } from "../vector";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const text = await extractText(file.path, file.mimetype);
    const numChunks = await vector.ingest(text, file.originalname);

    res.json({
      message: "File processed successfully",
      chunks: numChunks,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "File upload or embedding failed" });
  }
});

export default router;
