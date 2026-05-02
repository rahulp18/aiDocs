export class ScoringUtil {
  static fromVector(distance: number): number {
    return 1 - distance;
  }
  static fromKeyword(rank: number): number {
    return rank;
  }
  static combine(vectorScore: number, keywordScore: number): number {
    return vectorScore * 0.7 + keywordScore * 0.3;
  }
}
