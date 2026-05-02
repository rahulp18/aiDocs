import { Injectable } from '@nestjs/common';
import { LlmService } from '../../infra/ai/llm.service';
import { Chunk } from './type';

@Injectable()
export class AgenticChunker {
  constructor(private llmService: LlmService) {}
  async split(text: string): Promise<Chunk[]> {
    const prompt = `
Split document into meaningful chunks.

Return JSON:
{
  "chunks": [
    {
      "content": "...",
      "metadata": {
        "section": "...",
        "type": "..."
      }
    }
  ]
}

Document:
${text}
`;
    const response = await this.llmService.generateChunk(prompt);
    const chunks = (
      response as {
        chunks: { content: string; metadata: Record<string, unknown> }[];
      }
    ).chunks;
    return chunks.map((c) => ({
      content: c.content,
      metadata: {
        ...c.metadata,
        strategy: 'agentic',
      },
    }));
  }
}
