import { Injectable, NotFoundException } from '@nestjs/common';
import { Task, TaskPriority } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  async listForUser(userId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateTaskDto): Promise<Task> {
    const ai = await this.ai.analyzeTaskDescription({
      description: dto.description ?? '',
      title: dto.title,
    });

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority ?? ai.suggestedPriority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        aiSummary: ai.summary,
        aiSuggestedPriority: ai.suggestedPriority,
        userId,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateTaskDto): Promise<Task> {
    await this.ensureOwned(userId, id);
    return this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        dueDate:
          dto.dueDate === undefined
            ? undefined
            : dto.dueDate === null
              ? null
              : new Date(dto.dueDate),
      },
    });
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.ensureOwned(userId, id);
    await this.prisma.task.delete({ where: { id } });
  }

  private async ensureOwned(userId: string, taskId: string): Promise<Task> {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }
}
