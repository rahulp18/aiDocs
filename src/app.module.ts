import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DrizzleModule } from './infra/db/drizzle.module';
import { DocumentModule } from './module/document/document.module';
import { RagModule } from './module/rag/rag.module';

@Module({
  imports: [DrizzleModule, DocumentModule, RagModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
