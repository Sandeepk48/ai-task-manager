import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET) default → JSON health', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.body).toMatchObject({
          name: 'AI Task Manager API',
          status: 'ok',
        });
      });
  });

  it('/ (GET) with Accept: text/html → HTML page', () => {
    return request(app.getHttpServer())
      .get('/')
      .set('Accept', 'text/html')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect((res) => {
        expect(res.text).toContain('AI Task Manager API');
        expect(res.text).toContain('localhost:3000');
      });
  });

  it('/health (GET) → JSON', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.body).toMatchObject({
          name: 'AI Task Manager API',
          status: 'ok',
        });
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
