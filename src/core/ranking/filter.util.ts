import { RankedChunk } from './type';

export class FilterUtil {
  static byDistance(chunks: RankedChunk[], threshold = 0.4) {
    return chunks.filter(
      (c) => c.distance !== undefined && c.distance < threshold,
    );
  }
}
