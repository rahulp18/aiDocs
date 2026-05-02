import { Body, Controller, Post } from '@nestjs/common';
import { RagService } from './rag.service';

class AskDto {
  query!: string;
}

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('ask')
  ask(@Body() body: AskDto) {
    return this.ragService.ask(body.query);
  }
}
