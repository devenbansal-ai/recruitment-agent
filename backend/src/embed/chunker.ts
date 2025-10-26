import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function chunkTextWithMetadata(text: string, source: string, pageNumber?: number) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800, // characters (adjust as needed)
    chunkOverlap: 100, // ensures continuity
    separators: ["\n\n", ".", "!", "?", ";", ","],
  });

  const chunks = await splitter.createDocuments(
    [text],
    [
      {
        source,
        page_number: pageNumber ?? null,
      },
    ]
  );

  return chunks.map((chunk, index) => ({
    id: `${source}-${pageNumber ?? 0}-${index}`,
    content: chunk.pageContent,
    metadata: {
      source,
      pageNumber,
      chunkIndex: index,
      length: chunk.pageContent.length,
    },
  }));
}
