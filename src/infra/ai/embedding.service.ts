import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { env } from '../../config/env';

@Injectable()
export class EmbeddingService {
  private readonly client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  }
}
