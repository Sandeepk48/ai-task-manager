import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      name: 'AI Task Manager API',
      status: 'ok',
    };
  }
}
