import {
  CharacterTextSplitter,
  RecursiveCharacterTextSplitter,
} from '@langchain/textsplitters';
import { Injectable } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { LlmService } from './llm.service';
const CHUNKING_PROMPT = `
You are an expert document chunking system.

Task:
- Split the document into meaningful chunks
- Each chunk must contain a complete idea
- Do NOT break sentences

Return STRICT JSON in this format:
{
  "chunks": [
    {
      "content": "...",
      "metadata": {
        "section": "...",
        "subsection": "...",
        "type": "..."
      }
    }
  ]
}

Rules:
- No extra text
- No explanation
- Valid JSON only
`;
@Injectable()
export class ChunkingService {
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly llmService: LlmService,
  ) {}
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
  private isHeading(line: string): boolean {
    return line.length < 80 && /^[A-Z][A-Z\s0-9\-:]+$/.test(line.trim());
  }
  splitDocumentStructure(text: string) {
    const lines = text.split('\n');

    const sections: { title: string; content: string[] }[] = [];
    let currentSection: { title: string; content: string[] } = {
      title: 'General',
      content: [],
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (this.isHeading(trimmed)) {
        if (currentSection.content.length > 0) {
          sections.push(currentSection);
        }
        currentSection = { title: trimmed, content: [] };
      } else {
        currentSection.content.push(trimmed);
      }
    }
    if (currentSection.content.length > 0) {
      sections.push(currentSection);
    }
    return sections;
  }

  async documentAwareChunking(text: string) {
    const sections = this.splitDocumentStructure(text);
    const finalChunks: any[] = [];
    for (const section of sections) {
      const chunks = await this.semanticChunk(section.content.join(' '), 0.8);
      for (const chunk of chunks) {
        finalChunks.push({
          content: chunk,
          metadata: {
            section: section.title,
          },
        });
      }
    }
    return finalChunks;
  }
  async agenticChunking(text: string) {
    const response = await this.llmService.generateChunk(
      CHUNKING_PROMPT + `\n\nDocument:\n${text}`,
    );

    // 🔥 FIX HERE
    if (typeof response === 'string') {
      return JSON.parse(response);
    }

    // already parsed
    return response;
  }
}
