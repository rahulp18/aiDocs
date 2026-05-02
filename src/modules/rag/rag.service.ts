import { Injectable } from '@nestjs/common';
import { LlmService } from '../../infra/ai/llm.service';
import { RetrievalService } from '../retrieval/retrieval.service';

export interface RagAnswer {
  query: string;
  answer: string;
  sources: unknown[];
}

@Injectable()
export class RagService {
  constructor(
    private readonly retrieval: RetrievalService,
    private readonly llm: LlmService,
  ) {}

  async ask(query: string): Promise<RagAnswer> {
    const { results } = await this.retrieval.search(query);
    const context = results.map(
      (r) => (r as { content: string }).content ?? '',
    );
    const answer = await this.llm.generateAnswer(query, context);
    return { query, answer, sources: results };
  }
}
