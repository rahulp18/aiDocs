import { RankedChunk } from './type';

export class Reranker {
  static rerank(chunks: RankedChunk[], topK = 5): RankedChunk[] {
    return chunks
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, topK);
  }
}
