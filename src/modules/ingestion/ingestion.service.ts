import { Injectable } from '@nestjs/common';
import { DocumentService } from '../document/document.service';

@Injectable()
export class IngestionService {
  constructor(private readonly documentService: DocumentService) {}

  async ingest(
    file: Express.Multer.File,
  ): Promise<{ documentId: string; totalChunks: number }> {
    return this.documentService.processFile(file);
  }
}
