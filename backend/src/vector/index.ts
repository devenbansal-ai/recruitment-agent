import { ChromaVectorProvider } from "./chromaClient";
import { PineconeVectorProvider } from "./pineconeClient";
import { VectorProvider } from "./provider.types";

const providers: Record<string, VectorProvider> = {
  chroma: new ChromaVectorProvider(),
  pinecone: new PineconeVectorProvider(),
};

const getVectorProvider = (name: string): VectorProvider => {
  const provider = providers[name];
  if (!provider) throw new Error(`Vector provider ${name} not found`);
  return provider;
};

const activeProvider = process.env.VECTOR_PROVIDER || "chroma";
export const vector = getVectorProvider(activeProvider);
