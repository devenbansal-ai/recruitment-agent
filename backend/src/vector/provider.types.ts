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
  filter?: Record<string, any>;
}

export interface VectorProvider {
  name: string;
  upsert(items: VectorItem[]): Promise<void>;
  ingest(text: string, source: string, pageNumber?: number): Promise<number>;
  query(params: QueryParams): Promise<VectorResult[]>;
}

export interface CitationSource {
  id: number;
  title: string;
  url?: string;
  snippet: string;
}
