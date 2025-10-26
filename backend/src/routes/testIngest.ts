import fs from "fs";
import { chunkTextWithMetadata } from "../embed/chunker";
import { vector } from "../vector";

async function testIngest() {
  const text = fs.readFileSync("./data/chatgpt-tutorial.txt", "utf8");
  const chunks = await chunkTextWithMetadata(text, "chatgpt-tutorial.txt", 1);

  const vectors = chunks.map((e, i) => ({
    id: e.id,
    text: e.content,
    metadata: e.metadata,
  }));

  await vector.upsert(vectors);
}

testIngest();
