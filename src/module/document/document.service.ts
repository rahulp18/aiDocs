import { BadRequestException, Injectable } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';
import { v4 as uuid } from 'uuid';
import { DocumentRepository } from './document.repository';
import { EmbeddingService } from './embedding.service';
import { LlmService } from './llm.service';

type ChunkType = {
  content: string;
};

@Injectable()
export class DocumentService {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly embeddingService: EmbeddingService,
    private readonly llmService: LlmService,
  ) {}

  async processFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const parser = new PDFParse({ data: file.buffer });
    const result = await parser.getText();
    await parser.destroy();

    const text = result.text?.trim();
    if (!text) {
      throw new BadRequestException('Could not extract text from PDF');
    }

    const chunks = this.chunkText(text);
    const documentId = uuid();

    // 1️ Insert chunks (embedding = null)
    const insertedChunks = await this.documentRepository.createChunks(
      documentId,
      chunks.map((c) => ({ ...c, embedding: null })),
    );

    // 2️  Generate embeddings + update
    for (const chunk of insertedChunks) {
      const embedding = await this.embeddingService.generateEmbedding(
        chunk.content,
      );

      await this.documentRepository.updateEmbedding(chunk.id, embedding);
    }

    return {
      totalChunks: chunks.length,
      documentId,
    };
  }
  async search(query: string) {
    if (!query.trim()) {
      throw new BadRequestException('Query cannot be empty');
    }
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);
    const results = await this.documentRepository.searchSimilarChunks(
      queryEmbedding,
      5,
    );
    const context = results.rows.map((r) => r.content);
    return this.llmService.generateAnswer(query, context as string[]);
  }
  private chunkText(text: string, size = 500) {
    const chunks: ChunkType[] = [];

    for (let i = 0; i < text.length; i += size) {
      const chunk = text.slice(i, i + size).trim();
      if (chunk) chunks.push({ content: chunk });
    }

    return chunks;
  }
}
