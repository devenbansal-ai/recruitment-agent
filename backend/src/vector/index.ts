import { ChromaVectorProvider } from "./chromaClient";
import { VectorProvider } from "./provider.types";

const providers: Record<string, VectorProvider> = {
  chroma: new ChromaVectorProvider(),
};

export const getVectorProvider = (name: string): VectorProvider => {
  const provider = providers[name];
  if (!provider) throw new Error(`Vector provider ${name} not found`);
  return provider;
};
