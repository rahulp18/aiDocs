import { Injectable } from '@nestjs/common';
import { DocumentRepository } from '../document/document.repository';

@Injectable()
export class VectorSearchService {
  constructor(private readonly repo: DocumentRepository) {}

  async search(queryEmbedding: number[], limit = 20) {
    const results = await this.repo.searchSimilarChunks(queryEmbedding, limit);
    return results.rows;
  }
}
