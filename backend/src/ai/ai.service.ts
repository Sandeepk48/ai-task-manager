import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { TaskPriority } from '@prisma/client';

export type TaskAiSuggestion = {
  summary: string;
  suggestedPriority: TaskPriority;
};

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Uses the task description (and optional title for context) to produce
   * a short summary and a suggested priority (LOW / MEDIUM / HIGH).
   */
  async analyzeTaskDescription(input: {
    description: string;
    title?: string | null;
  }): Promise<TaskAiSuggestion> {
    const description = (input.description ?? '').trim();
    const title = (input.title ?? '').trim();

    const userContent = this.buildUserContent(description, title);
    if (!userContent) {
      return this.fallbackSuggestion(title, description);
    }

    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'OPENAI_API_KEY is not set; using placeholder summary and priority.',
      );
      return this.fallbackSuggestion(title, description);
    }

    const client = new OpenAI({ apiKey });
    const model =
      this.config.get<string>('OPENAI_MODEL')?.trim() || 'gpt-4o-mini';

    try {
      const completion = await client.chat.completions.create({
        model,
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You analyze task descriptions. Given a task's description (and optionally its title), respond with JSON only:
{"summary": string (1-3 short sentences capturing the essence of the work), "suggestedPriority": "LOW" | "MEDIUM" | "HIGH"}
Use LOW for low urgency or nice-to-have work, MEDIUM for standard work, HIGH for urgent, risky, or time-sensitive work.`,
          },
          { role: 'user', content: userContent },
        ],
      });

      const raw = completion.choices[0]?.message?.content;
      if (!raw) {
        return this.fallbackSuggestion(title, description);
      }

      let parsed: { summary?: string; suggestedPriority?: string };
      try {
        parsed = JSON.parse(raw) as {
          summary?: string;
          suggestedPriority?: string;
        };
      } catch {
        return this.fallbackSuggestion(title, description);
      }

      const suggestedPriority = this.normalizePriority(
        parsed.suggestedPriority,
      );
      return {
        summary:
          parsed.summary?.trim() ||
          this.defaultSummary(title, description),
        suggestedPriority,
      };
    } catch (error) {
      this.logger.error('OpenAI request failed', error);
      return this.fallbackSuggestion(title, description);
    }
  }

  private buildUserContent(description: string, title: string): string {
    if (description.length > 0) {
      const parts = [`Task description:\n${description}`];
      if (title.length > 0) {
        parts.unshift(`Task title: ${title}`);
      }
      return parts.join('\n\n');
    }
    if (title.length > 0) {
      return `Task title: ${title}\n\nNo description was provided. Infer a concise summary and priority from the title alone.`;
    }
    return '';
  }

  private normalizePriority(value: string | undefined): TaskPriority {
    const upper = value?.toUpperCase();
    if (upper === 'LOW' || upper === 'MEDIUM' || upper === 'HIGH') {
      return upper as TaskPriority;
    }
    return TaskPriority.MEDIUM;
  }

  private fallbackSuggestion(
    title: string,
    description: string,
  ): TaskAiSuggestion {
    return {
      summary: this.defaultSummary(title, description),
      suggestedPriority: TaskPriority.MEDIUM,
    };
  }

  private defaultSummary(title: string, description: string) {
    if (description.length > 0) {
      return description.length > 280
        ? `${description.slice(0, 277)}...`
        : description;
    }
    if (title.length > 0) {
      return `Task "${title}" (no description provided).`;
    }
    return 'No task details were provided.';
  }
}
