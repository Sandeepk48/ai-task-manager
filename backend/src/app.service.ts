import { Injectable } from '@nestjs/common';
import { AiService } from './ai/ai.service';

@Injectable()
export class AppService {
  constructor(private readonly aiService: AiService) {}

  getHealth() {
    return {
      name: 'AI Task Manager API',
      status: 'ok',
      openaiConfigured: this.aiService.hasOpenAiApiKey(),
    };
  }
}
