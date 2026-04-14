import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TaskAiPreviewDto } from './dto/task-ai-preview.dto';
import { AiService } from './ai.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('tasks/preview')
  preview(@Body() dto: TaskAiPreviewDto) {
    return this.ai.analyzeTaskDescription({
      description: dto.description ?? '',
      title: dto.title,
    });
  }
}
