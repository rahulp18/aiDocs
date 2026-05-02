import { CharacterTextSplitter } from '@langchain/textsplitters';
import { Chunk } from './type';

export class FixedChunker {
  constructor(
    private chunkSize = 500,
    private overLapSize = 100,
  ) {}
  async split(text: string): Promise<Chunk[]> {
    if (!text.trim()) return Promise.resolve([]);
    const splitter = new CharacterTextSplitter({
      chunkSize: this.chunkSize,
      chunkOverlap: this.overLapSize,
      separator: '',
    });
    return splitter
      .splitText(text)
      .then((chunks) => chunks.map((chunk) => ({ content: chunk })));
  }
}
