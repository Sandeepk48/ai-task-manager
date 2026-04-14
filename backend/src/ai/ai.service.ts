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

    const apiKey = this.resolveOpenAiApiKey();
    if (!apiKey) {
      this.logger.warn(
        'OPENAI_API_KEY is empty or missing; using placeholder summary.',
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
{"summary": string (1-3 short sentences), "suggestedPriority": "LOW" | "MEDIUM" | "HIGH"}

Rules:
- The summary must paraphrase and compress the work. Do NOT copy the description verbatim or paste long phrases unchanged.
- Use LOW for low urgency or nice-to-have work, MEDIUM for standard work, HIGH for urgent, risky, or time-sensitive work.`,
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
      let summary = parsed.summary?.trim();
      if (!summary) {
        summary = this.paraphraseStub(title, description);
      } else if (this.summaryEchoesDescription(summary, description)) {
        this.logger.warn(
          'OpenAI summary matched description too closely; using condensed stub.',
        );
        summary = this.paraphraseStub(title, description);
      }
      return {
        summary,
        suggestedPriority,
      };
    } catch (error) {
      this.logOpenAiFailure(error);
      return this.fallbackSuggestion(title, description);
    }
  }

  /** ConfigService + process.env; trim whitespace and strip accidental quotes. */
  private resolveOpenAiApiKey(): string {
    const raw =
      this.config.get<string>('OPENAI_API_KEY') ?? process.env.OPENAI_API_KEY;
    if (raw == null) {
      return '';
    }
    let v = String(raw).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1).trim();
    }
    return v;
  }

  private logOpenAiFailure(error: unknown): void {
    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as { status?: number }).status;
      const msg =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`OpenAI API error (HTTP ${status ?? '?'}): ${msg}`);
      return;
    }
    if (error instanceof Error) {
      this.logger.error(`OpenAI request failed: ${error.message}`, error.stack);
      return;
    }
    this.logger.error('OpenAI request failed', error);
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
      summary: this.unavailableSummary(title, description),
      suggestedPriority: TaskPriority.MEDIUM,
    };
  }

  /** When AI is off or failed: clear message — never duplicate the full description into aiSummary. */
  private unavailableSummary(title: string, description: string): string {
    const t = title.trim() || 'This task';
    const hasDesc = description.trim().length > 0;
    const base =
      'AI summary is unavailable. On the API host, set a valid OPENAI_API_KEY (and check billing/limits). ' +
      'The full text you entered stays in the Description field.';
    if (hasDesc) {
      return `${base} Working title: “${t}”.`;
    }
    return `${base} Working title: “${t}” (no description yet).`;
  }

  private summaryEchoesDescription(summary: string, description: string): boolean {
    const s = summary.trim();
    const d = description.trim();
    if (!s || !d) return false;
    if (s === d) return true;
    if (d.length >= 40 && s.includes(d.slice(0, Math.min(40, d.length)))) {
      return true;
    }
    return false;
  }

  /** Short non-echoing line when the model parrots the description. */
  private paraphraseStub(title: string, description: string): string {
    const t = title.trim() || 'This task';
    const words = description.trim().split(/\s+/).filter(Boolean).slice(0, 8);
    const teaser = words.length ? words.join(' ') + (description.trim().split(/\s+/).length > 8 ? '…' : '') : '';
    return teaser
      ? `Summary: “${t}” — touches on: ${teaser}. (Condensed; configure OpenAI for a richer summary.)`
      : `Summary: “${t}”. (Configure OpenAI for a generated summary.)`;
  }
}
