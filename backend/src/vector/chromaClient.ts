import { ChromaClient } from "chromadb";
import { OpenAIEmbeddingFunction } from "@chroma-core/openai";
import { VectorProvider, VectorItem, VectorResult } from "./provider.types.js";
import Logger from "../utils/logger";
import { LOGGER_TAGS } from "../utils/tags";

export class ChromaVectorProvider implements VectorProvider {
  name = "chroma";
  private client: ChromaClient;
  private collection: any;

  constructor() {
    this.client = new ChromaClient();
  }

  async init() {
    Logger.log(LOGGER_TAGS.STARTING_CHROMA_CLIENT);
    const embeddingFn = new OpenAIEmbeddingFunction({
      modelName: "text-embedding-3-small",
    });

    this.collection = await this.client.getOrCreateCollection({
      name: "my_collection_1",
      embeddingFunction: embeddingFn,
    });
  }

  async upsert(items: VectorItem[]): Promise<void> {
    if (!this.collection) await this.init();
    Logger.log(LOGGER_TAGS.UPSERT_ITEM_START);

    await this.collection.add({
      ids: items.map((i) => i.id),
      documents: items.map((i) => i.text),
      metadatas: items.map((i) => i.metadata),
    });
    Logger.log(LOGGER_TAGS.UPSERT_ITEM_END);
  }

  async query(text: string, limit = 3): Promise<VectorResult[]> {
    if (!this.collection) await this.init();

    const result = await this.collection.query({
      queryTexts: [text],
      nResults: limit,
    });

    return (result.ids[0] || []).map((id: string, idx: number) => ({
      id,
      text: result.documents[0][idx],
      score: result.distances[0][idx],
      metadata: result.metadatas[0][idx],
    }));
  }
}
