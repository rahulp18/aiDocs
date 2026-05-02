/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';

@Injectable()
export class RerankerService {
  rerank(chunks: any[], topK = 5) {
    return chunks.sort((a, b) => b.score - a.score).slice(0, topK);
  }
}
