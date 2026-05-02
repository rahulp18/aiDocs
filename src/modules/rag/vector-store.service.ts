import { Injectable } from '@nestjs/common';
import { Chunk } from '../../core/chunking/type';
import { EmbeddingService } from '../../infra/ai/embedding.service';
import { DocumentRepository } from '../document/document.repository';

@Injectable()
export class VectorStoreService {
  constructor(
    private readonly repo: DocumentRepository,
    private readonly embedding: EmbeddingService,
  ) {}

  async search(queryEmbedding: number[], limit = 20): Promise<unknown[]> {
    const result = await this.repo.searchSimilarChunks(queryEmbedding, limit);
    return result.rows;
  }

  async indexChunks(documentId: string, chunks: Chunk[]): Promise<void> {
    const enriched = await Promise.all(
      chunks.map(async (chunk) => ({
        documentId,
        content: chunk.content,
        metadata: chunk.metadata ?? null,
        embedding: await this.embedding.generateEmbedding(chunk.content),
      })),
    );
    await this.repo.insertChunks(enriched);
  }
}
