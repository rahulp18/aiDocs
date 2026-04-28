import { Module } from '@nestjs/common';
import { RagModule } from '../rag/rag.module';
import { DocumentController } from './document.controller';
import { DocumentRepository } from './document.repository';
import { DocumentService } from './document.service';
import { LlmService } from './llm.service';

@Module({
  imports: [RagModule],
  controllers: [DocumentController],
  providers: [DocumentService, DocumentRepository, LlmService],
})
export class DocumentModule {}
