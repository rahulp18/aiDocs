/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';

@Injectable()
export class HybridSearchService {
  merge(vectorResults: any[], keywordResults: any[]) {
    const map = new Map<number, any>();
    for (const v of vectorResults) {
      map.set(v.id, {
        ...v,
        score: 1 - v.distance,
      });
    }

    for (const k of keywordResults) {
      if (map.has(k.id)) {
        map.get(k.id).score += k.rank;
      } else {
        map.set(k.id, {
          ...k,
          score: k.rank,
        });
      }
    }
    return Array.from(map.values());
  }
}
