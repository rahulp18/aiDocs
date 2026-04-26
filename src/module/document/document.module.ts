import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentRepository } from './document.repository';
import { DocumentService } from './document.service';
import { EmbeddingService } from './embedding.service';
import { LlmService } from './llm.service';

@Module({
  controllers: [DocumentController],
  providers: [
    DocumentService,
    DocumentRepository,
    EmbeddingService,
    LlmService,
  ],
})
export class DocumentModule {}
