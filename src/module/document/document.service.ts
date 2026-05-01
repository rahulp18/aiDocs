/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BadRequestException, Injectable } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';
import { v4 as uuid } from 'uuid';
import { ChunkingService } from '../rag/chunking.service';
import { DocumentRepository } from './document.repository';

import { EmbeddingService } from '../rag/embedding.service';
import { LlmService } from '../rag/llm.service';

@Injectable()
export class DocumentService {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly embeddingService: EmbeddingService,
    private readonly llmService: LlmService,
    private readonly chunkingService: ChunkingService,
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

    const chunks = await this.chunkingService.agenticChunking(text);
    const documentId = uuid();

    // 1️ Insert chunks (embedding = null)
    // const insertedChunks = await this.documentRepository.createChunks(
    //   documentId,
    //   chunks,
    // );

    // 2️  Generate embeddings + update
    // for (const chunk of insertedChunks) {
    //   const embedding = await this.embeddingService.generateEmbedding(
    //     chunk.content,
    //   );

    //   await this.documentRepository.updateEmbedding(chunk.id, embedding);
    // }

    return {
      totalChunks: chunks.length,
      documentId,
      chunks,
    };
  }
  async search(query: string) {
    if (!query?.trim()) {
      throw new BadRequestException('Query cannot be empty');
    }
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);
    const results = await this.documentRepository.searchSimilarChunks(
      queryEmbedding,
      10,
    );
    const THRESHOLD = 0.7;
    const filtered = results.rows.filter((r: any) => r.distance >= THRESHOLD);
    const sorted = filtered.sort((a: any, b: any) => b.distance - a.distance);
    const topChunk = sorted.slice(0, 5);
    if (topChunk.length === 0) {
      return {
        answer: 'No Relevant Information Found',
        sources: [],
      };
    }

    const context = topChunk.map((r) => r.content);
    const answer = this.llmService.generateAnswer(query, context as string[]);
    return {
      answer,
      sources: topChunk,
    };
  }
}
