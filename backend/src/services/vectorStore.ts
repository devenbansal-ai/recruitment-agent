import { IndexList, Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export const getPineconeIndex = () => {
  const indexName = process.env.PINECONE_INDEX!;
  return pinecone.index(indexName);
};

export async function getPineconeIndexes(): Promise<IndexList> {
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

  const existing = await pinecone.listIndexes();
  return existing;
}
