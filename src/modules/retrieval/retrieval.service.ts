/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { EmbeddingService } from '../../infra/ai/embedding.service';
import { HybridSearchService } from './hybrid-search.service';
import { KeywordSearchService } from './keyword-search.service';
import { RerankerService } from './reranker.service';
import { VectorSearchService } from './vector-search.service';

@Injectable()
export class RetrievalService {
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly vectorSearch: VectorSearchService,
    private readonly keywordSearch: KeywordSearchService,
    private readonly hybridSearch: HybridSearchService,
    private readonly reranker: RerankerService,
  ) {}

  async search(query: string): Promise<{ query: string; results: unknown[] }> {
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);
    const vectorResults = await this.vectorSearch.search(queryEmbedding, 20);
    const keywordResults = await this.keywordSearch.search(query, 20);
    const merged = this.hybridSearch.merge(vectorResults, keywordResults);
    const topChunks = this.reranker.rerank(merged, 5);
    return { query, results: topChunks };
  }
}
