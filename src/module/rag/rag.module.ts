import { Module } from '@nestjs/common';
import { ChunkingService } from './chunking.service';
import { EmbeddingService } from './embedding.service';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';

@Module({
  controllers: [RagController],
  providers: [RagService, ChunkingService, EmbeddingService],
  exports: [RagService, ChunkingService, EmbeddingService],
})
export class RagModule {}
