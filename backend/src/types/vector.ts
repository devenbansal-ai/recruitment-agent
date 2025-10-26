export type Chunk = {
  id: string;
  content: any;
  metadata: {
    source: string;
    pageNumber: number;
    chunkIndex: number;
    length: any;
  };
};
