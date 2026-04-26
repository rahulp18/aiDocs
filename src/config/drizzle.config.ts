import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/infra/db/schema/document.schema.ts',
  out: './src/infra/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      'postgresql://postgres:root@localhost:5434/rag_db',
  },
});
