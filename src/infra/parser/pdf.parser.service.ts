import { BadRequestException, Injectable } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';

@Injectable()
export class PdfParserService {
  async parse(buffer: Buffer): Promise<string> {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();

    const text = result.text?.trim();
    if (!text) {
      throw new BadRequestException('Could not extract text from the PDF');
    }
    return text;
  }
}
