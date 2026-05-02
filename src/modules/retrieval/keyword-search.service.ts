import { Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DrizzleService } from '../../infra/db/drizzle.service';

@Injectable()
export class KeywordSearchService {
  constructor(private readonly drizzle: DrizzleService) {}

  async search(query: string, limit = 20) {
    const result = await this.drizzle.db.execute(sql`
      SELECT id, content, metadata,
        ts_rank_cd(to_tsvector(content), plainto_tsquery(${query})) AS rank
      FROM document_chunks
      WHERE to_tsvector(content) @@ plainto_tsquery(${query})
      ORDER BY rank DESC
      LIMIT ${limit};
    `);
    return result.rows;
  }
}
