import { pgTable, serial, text, timestamp, vector } from 'drizzle-orm/pg-core';

export const documentChunks = pgTable('document_chunks', {
  id: serial('id').primaryKey(),
  documentId: text('document_id').notNull(),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
