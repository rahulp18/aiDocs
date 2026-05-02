import { Module } from '@nestjs/common';
import { RagModule } from '../rag/rag.module';
import { QaService } from './qa.service';

@Module({
  imports: [RagModule],
  providers: [QaService],
  exports: [QaService],
})
export class QaModule {}
