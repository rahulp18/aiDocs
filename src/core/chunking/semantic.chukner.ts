/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { EmbeddingService } from '../../infra/ai/embedding.service';
import { Chunk } from './type';

@Injectable()
export class SemanticChunker {
  private readonly threshold = 0.82;

  constructor(private readonly embeddingService: EmbeddingService) {}
  async split(text: string, threshold = this.threshold): Promise<Chunk[]> {
    const sentences = this.splitSentences(text);
    if (sentences.length === 0) return [];
    const embeddings = await Promise.all(
      sentences.map((sentence) =>
        this.embeddingService.generateEmbedding(sentence),
      ),
    );
    const chunks: Chunk[] = [];
    let currentChunk = sentences[0];
    for (let i = 1; i < sentences.length; i++) {
      const score = this.cosineSimilarity(embeddings[i - 1], embeddings[i]);
      if (score >= threshold) {
        currentChunk += ' ' + sentences[i];
      } else {
        chunks.push({ content: currentChunk });
        currentChunk = sentences[i];
      }
    }
    chunks.push({ content: currentChunk });

    return chunks;
  }
  cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  }
  private splitSentences(text: string): string[] {
    return text.split(/(?<=[.?!])\s+/).filter((s) => s.trim().length > 0);
  }
}
