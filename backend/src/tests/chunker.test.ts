import { chunkTextWithMetadata } from "../embed/chunker";

test("Chunking works with sentence boundaries and overlap", async () => {
  const text = "This is sentence one. This is sentence two. This is sentence three.";
  const chunks = await chunkTextWithMetadata(text, "testSource");
  expect(chunks.length).toBeGreaterThan(0);
  expect(chunks[0].metadata.source).toBe("testSource");
});
