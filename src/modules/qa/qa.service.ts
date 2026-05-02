import { Injectable } from '@nestjs/common';
import { RagService } from '../rag/rag.service';

export interface QaResult {
  question: string;
  answer: string;
  sources: unknown[];
}

@Injectable()
export class QaService {
  constructor(private readonly ragService: RagService) {}

  async ask(question: string): Promise<QaResult> {
    const result = await this.ragService.ask(question);
    return {
      question: result.query,
      answer: result.answer,
      sources: result.sources,
    };
  }
}
