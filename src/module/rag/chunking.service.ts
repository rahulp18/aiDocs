import {
  CharacterTextSplitter,
  RecursiveCharacterTextSplitter,
} from '@langchain/textsplitters';
import { Injectable } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
@Injectable()
export class ChunkingService {
  constructor(private readonly embeddingService: EmbeddingService) {}
  async splitFixedSize(
    text: string,
    chunkSize = 500,
    overLap = 100,
  ): Promise<string[]> {
    if (!text.trim()) return [];
    const splitter = new CharacterTextSplitter({
      chunkSize,
      chunkOverlap: overLap,
      separator: '',
    });
    return splitter.splitText(text);
  }
  async splitByRecursively(
    text: string,
    chunkSize = 500,
    overLap = 100,
  ): Promise<string[]> {
    if (!text.trim()) return [];
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap: overLap,
    });
    return splitter.splitText(text);
  }
  async semanticChunk(text: string, threshold = 0.82): Promise<string[]> {
    const sentences = this.splitSentences(text);
    if (sentences.length === 0) return [];
    const embeddings = await Promise.all(
      sentences.map((sentence) =>
        this.embeddingService.generateEmbedding(sentence),
      ),
    );
    const chunks: string[] = [];
    let currentChunk = sentences[0];
    for (let i = 1; i < sentences.length; i++) {
      const score = this.cosineSimilarity(embeddings[i - 1], embeddings[i]);
      if (score >= threshold) {
        currentChunk += ' ' + sentences[i];
      } else {
        chunks.push(currentChunk);
        currentChunk = sentences[i];
      }
    }
    chunks.push(currentChunk);
    return chunks;
    // return chunks.map(
    //   (chunk, index) =>
    //     new Document({
    //       pageContent: chunk,
    //       metadata: {
    //         chunkIndex: index,
    //         strategy: 'semantic',
    //       },
    //     }),
    // );
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
