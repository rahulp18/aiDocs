export interface RankedChunk {
  id: number;
  content: string;
  distance?: number;
  rank?: number;
  score?: number;
  metadata?: Record<string, any>;
}
