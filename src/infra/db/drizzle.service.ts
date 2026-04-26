import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../../config/env';
import { schema } from './schema';

@Injectable()
export class DrizzleService implements OnModuleDestroy {
  private readonly pool: Pool;
  readonly db: NodePgDatabase<typeof schema>;

  constructor() {
    this.pool = new Pool({ connectionString: env.DATABASE_URL });
    this.db = drizzle(this.pool, { schema });
  }
  async onModuleInit() {
    await this.pool.query('SELECT 1');
  }
  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
