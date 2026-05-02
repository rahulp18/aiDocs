import { Module } from '@nestjs/common';
import { SemanticChunker } from '../../core/chunking/semantic.chukner';
import { PdfParserService } from '../../infra/parser/pdf.parser.service';
import { DocumentController } from './document.controller';
import { DocumentRepository } from './document.repository';
import { DocumentService } from './document.service';

@Module({
  controllers: [DocumentController],
  providers: [
    DocumentService,
    DocumentRepository,
    SemanticChunker,
    PdfParserService,
  ],
  exports: [DocumentRepository, DocumentService],
})
export class DocumentModule {}
