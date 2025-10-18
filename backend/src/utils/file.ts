import fs from "fs";
import { PDFParse } from "pdf-parse";
import { marked } from "marked";

export async function extractText(filePath: string, mimeType: string) {
  const buffer = fs.readFileSync(filePath);
  if (mimeType.includes("pdf")) {
    const pdfParse = new PDFParse({ data: buffer });
    const data = await pdfParse.getText();
    return data.text;
  } else if (mimeType.includes("markdown") || filePath.endsWith(".md")) {
    return marked.parse(buffer.toString());
  }
  throw new Error("Unsupported file type");
}
