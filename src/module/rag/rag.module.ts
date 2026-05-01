import { Module } from '@nestjs/common';
import { ChunkingService } from './chunking.service';
import { EmbeddingService } from './embedding.service';
import { LlmService } from './llm.service';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';

@Module({
  controllers: [RagController],
  providers: [RagService, ChunkingService, EmbeddingService, LlmService],
  exports: [RagService, ChunkingService, EmbeddingService, LlmService],
})
export class RagModule {}
