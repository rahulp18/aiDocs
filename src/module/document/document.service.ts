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

    const agentResult = await this.chunkingService.agenticChunking(text);
    const documentId = uuid();
    const chunks = agentResult.chunks ?? agentResult;
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
    const enrichedChunks = await Promise.all(
      chunks.map(async (chunk: any) => {
        const embedding = await this.embeddingService.generateEmbedding(
          chunk.content,
        );
        return {
          documentId,
          content: chunk.content,
          metadata: chunk.metadata,
          embedding,
        };
      }),
    );
    await this.documentRepository.insertChunks(enrichedChunks);
    return {
      totalChunks: chunks.length,
      documentId,
      chunks: enrichedChunks,
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

    const sorted = results.rows.sort(
      (a: any, b: any) => a.distance - b.distance,
    );

    const topChunk = sorted.slice(0, 5);

    if (topChunk.length === 0) {
      return {
        answer: 'No Relevant Information Found',
        sources: [],
      };
    }

    const context = topChunk.map(
      (r: any) => `
Section: ${r.metadata?.section}
Subsection: ${r.metadata?.subsection}

${r.content}
`,
    );

    const answer = await this.llmService.generateAnswer(query, context);

    return {
      answer,
      // sources: topChunk,
    };
  }
}
