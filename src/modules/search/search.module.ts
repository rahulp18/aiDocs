import { Module } from '@nestjs/common';
import { RetrievalModule } from '../retrieval/retrieval.module';
import { SearchController } from './search.controller';

@Module({
  imports: [RetrievalModule],
  controllers: [SearchController],
})
export class SearchModule {}
