import { VectorProvider, VectorItem, VectorResult, QueryParams } from "./provider.types";
import Logger from "../utils/logger";
import { LOGGER_TAGS } from "../utils/tags";
import { Index, PineconeRecord, RecordMetadata } from "@pinecone-database/pinecone";
import { llm } from "../llm/index";
import { getPineconeIndex } from "../services/vectorStore";
import { chunkTextWithMetadata } from "../embed/chunker";

export class PineconeVectorProvider implements VectorProvider {
  name = "pinecone";
  private index: Index<RecordMetadata>;

  constructor() {
    this.index = getPineconeIndex();
  }

  async ingest(text: string, source: string, pageNumber?: number): Promise<number> {
    const chunks = await chunkTextWithMetadata(text, source, pageNumber);

    const vectors = chunks.map((e, i) => ({
      id: e.id,
      text: e.content,
      metadata: e.metadata,
    }));

    await this.upsert(vectors);

    return chunks.length;
  }

  async upsert(items: VectorItem[]): Promise<void> {
    Logger.log(LOGGER_TAGS.UPSERT_ITEM_START);

    const vectors: PineconeRecord<RecordMetadata>[] = [];
    for (const item of items) {
      const embedding = await llm.createEmbedding(item.text);

      vectors.push({
        id: item.id,
        values: embedding,
        metadata: { ...item.metadata, content: item.text },
      });
    }
    await this.index.upsert(vectors);
    Logger.log(`✅ Upserted ${vectors.length} vectors to Pinecone`);

    Logger.log(LOGGER_TAGS.UPSERT_ITEM_END);
  }

  async query(params: QueryParams): Promise<VectorResult[]> {
    // 1️⃣ Embed query
    const embedding = await llm.createEmbedding(params.query);

    // 2️⃣ Query Pinecone
    const results = await this.index.query({
      vector: embedding,
      topK: params.topK ?? 3,
      includeMetadata: true,
    });

    Logger.log(LOGGER_TAGS.PINECONE_QUERY_MATCHES, results.matches);

    return results.matches.map((match) => {
      return {
        id: match.id,
        text: (match.metadata?.content ?? "") as string,
        score: match.score ?? 0.6,
        metadata: match.metadata,
      };
    });
  }
}
