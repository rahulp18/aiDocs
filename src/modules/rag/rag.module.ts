import { Module } from '@nestjs/common';
import { DocumentModule } from '../document/document.module';
import { RetrievalModule } from '../retrieval/retrieval.module';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { VectorStoreService } from './vector-store.service';

@Module({
  imports: [RetrievalModule, DocumentModule],
  controllers: [RagController],
  providers: [RagService, VectorStoreService],
  exports: [RagService, VectorStoreService],
})
export class RagModule {}
