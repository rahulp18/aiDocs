import { Module } from '@nestjs/common';
import { DocumentModule } from '../document/document.module';
import { IngestionService } from './ingestion.service';

@Module({
  imports: [DocumentModule],
  providers: [IngestionService],
  exports: [IngestionService],
})
export class IngestionModule {}
