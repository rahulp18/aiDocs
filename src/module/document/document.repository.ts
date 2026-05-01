import { Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DrizzleService } from '../../infra/db/drizzle.service';
import { documentChunks } from '../../infra/db/schema/document.schema';

@Injectable()
export class DocumentRepository {
  constructor(private readonly drizzle: DrizzleService) {}
  async createChunks(documentId: string, chunks: string[]) {
    const data = chunks.map((chunk) => ({
      documentId,
      content: chunk,
      embedding: null,
    }));
    return await this.drizzle.db
      .insert(documentChunks)
      .values(data)
      .returning();
  }
  async updateEmbedding(id: number, embedding: number[] | null) {
    return await this.drizzle.db
      .update(documentChunks)
      .set({ embedding })
      .where(eq(documentChunks.id, id))
      .returning();
  }
  async insertChunks(data: any[]) {
    return await this.drizzle.db
      .insert(documentChunks)
      .values(data)
      .returning();
  }
  // async searchSimilarChunks(queryEmbedding: number[], limit = 5) {
  //   return await this.drizzle.db.execute(sql`
  //   SELECT
  //     id,
  //     document_id,
  //     content,
  //     embedding <-> ${queryEmbedding} AS distance
  //   FROM document_chunks
  //   WHERE embedding IS NOT NULL
  //   ORDER BY embedding <-> ${queryEmbedding}
  //   LIMIT ${limit};
  // `);
  // }

  async searchSimilarChunks(queryEmbedding: number[], limit = 5) {
    const vector = `[${queryEmbedding.join(',')}]`;

    return await this.drizzle.db.execute(sql`
    SELECT 
      id,
      document_id,
      content,
      metadata,
      embedding <=> ${vector}::vector AS distance
    FROM document_chunks
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> ${vector}::vector
    LIMIT ${limit};
  `);
  }
}
