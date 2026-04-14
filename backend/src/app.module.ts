import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // On Render/Railway, secrets live in process.env. Ignore .env file in
      // production so a stale committed template cannot shadow real env vars.
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    TasksModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
