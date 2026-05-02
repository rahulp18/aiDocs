import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileService {
  private readonly uploadDir = 'uploads';

  async saveFile(file: Express.Multer.File): Promise<string> {
    await fs.promises.mkdir(this.uploadDir, { recursive: true });
    const filePath = path.join(
      this.uploadDir,
      `${Date.now()}-${file.originalname}`,
    );
    await fs.promises.writeFile(filePath, file.buffer);
    return filePath;
  }

  async deleteFile(filePath: string): Promise<void> {
    await fs.promises.unlink(filePath);
  }
}
