import { Global, Module } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { LlmService } from './llm.service';

@Global()
@Module({
  providers: [EmbeddingService, LlmService],
  exports: [EmbeddingService, LlmService],
})
export class AiModule {}
