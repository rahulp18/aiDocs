import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { env } from '../../config/env';

@Injectable()
export class LlmService {
  private client: OpenAI;
  constructor() {
    this.client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }
  async generateAnswer(query: string, context: string[]): Promise<string> {
    const prompt = `
You are an AI assistant.

Answer the question using ONLY the context below.

Context:
${context.join('\n\n')}

Question:
${query}
`;

    const res = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You answer based only on provided context.',
        },
        { role: 'user', content: prompt },
      ],
    });

    return res.choices[0].message.content ?? '';
  }
  async generateChunk(text: string): Promise<any> {
    const res = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a JSON generator. Always return valid JSON only. No extra text.',
        },
        { role: 'user', content: text },
      ],
      response_format: { type: 'json_object' }, // 🔥 THIS IS KEY
    });
    const content = res.choices[0].message.content ?? '{}';
    return JSON.parse(content);
  }
}
