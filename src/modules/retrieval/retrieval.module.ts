import { Module } from '@nestjs/common';
import { DocumentModule } from '../document/document.module';
import { HybridSearchService } from './hybrid-search.service';
import { KeywordSearchService } from './keyword-search.service';
import { RerankerService } from './reranker.service';
import { RetrievalService } from './retrieval.service';
import { VectorSearchService } from './vector-search.service';

@Module({
  imports: [DocumentModule],
  providers: [
    RetrievalService,
    VectorSearchService,
    KeywordSearchService,
    HybridSearchService,
    RerankerService,
  ],
  exports: [RetrievalService],
})
export class RetrievalModule {}
