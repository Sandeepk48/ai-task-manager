import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { AppController } from './app.controller';
import { AppService } from './app.service';

function mockResponse(): Response {
  const res = {
    type: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('GET / sends JSON when Accept is not HTML-first', () => {
    const res = mockResponse();
    appController.root({ headers: {} } as Request, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'AI Task Manager API',
        status: 'ok',
      }),
    );
  });

  it('GET / sends HTML when browser Accept includes text/html', () => {
    const res = mockResponse();
    appController.root(
      { headers: { accept: 'text/html,application/xhtml+xml' } } as Request,
      res,
    );
    expect(res.type).toHaveBeenCalledWith('html');
    expect(res.send).toHaveBeenCalledWith(
      expect.stringContaining('http://localhost:3000'),
    );
  });

  it('GET /health sends JSON', () => {
    const res = mockResponse();
    appController.health(res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ok', name: 'AI Task Manager API' }),
    );
  });
});
