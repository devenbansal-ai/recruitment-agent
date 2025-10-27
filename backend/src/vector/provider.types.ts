export interface VectorItem {
  id: string;
  text: string;
  metadata?: Record<string, any>;
}

export interface VectorResult {
  id: string;
  text: string;
  score: number;
  metadata?: Record<string, any>;
}

export interface QueryParams {
  query: string;
  topK?: number;
  includeMetadata?: boolean;
  filter?: Record<string, any>;
}

export interface VectorProvider {
  name: string;
  upsert(items: VectorItem[]): Promise<void>;
  query(params: QueryParams): Promise<VectorResult[]>;
}
