import { Controller, Get, Query } from '@nestjs/common';
import { RetrievalService } from '../retrieval/retrieval.service';

@Controller('search')
export class SearchController {
  constructor(private readonly retrieval: RetrievalService) {}

  @Get()
  async search(@Query('q') query: string) {
    return this.retrieval.search(query);
  }
}
