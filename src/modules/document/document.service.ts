import { BadRequestException, Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { SemanticChunker } from '../../core/chunking/semantic.chukner';
import { EmbeddingService } from '../../infra/ai/embedding.service';
import { PdfParserService } from '../../infra/parser/pdf.parser.service';
import { DocumentRepository } from './document.repository';

@Injectable()
export class DocumentService {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly embeddingService: EmbeddingService,
    private readonly semanticChunk: SemanticChunker,
    private readonly pdfParser: PdfParserService,
  ) {}

  async processFile(file: Express.Multer.File): Promise<{
    documentId: string;
    totalChunks: number;
  }> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const text = await this.pdfParser.parse(file.buffer);
    const chunks = await this.semanticChunk.split(text);
    const documentId = uuid();

    const enrichedChunks = await Promise.all(
      chunks.map(async (chunk) => ({
        documentId,
        content: chunk.content,
        metadata: chunk.metadata ?? null,
        embedding: await this.embeddingService.generateEmbedding(chunk.content),
      })),
    );

    await this.documentRepository.insertChunks(enrichedChunks);
    return { documentId, totalChunks: chunks.length };
  }
}
