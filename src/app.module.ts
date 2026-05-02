import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './infra/ai/ai.module';
import { DrizzleModule } from './infra/db/drizzle.module';
import { DocumentModule } from './modules/document/document.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { QaModule } from './modules/qa/qa.module';
import { RagModule } from './modules/rag/rag.module';
import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [
    DrizzleModule,
    AiModule,
    DocumentModule,
    RagModule,
    SearchModule,
    IngestionModule,
    QaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
