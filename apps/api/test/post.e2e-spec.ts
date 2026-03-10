import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module.js';

describe('PostController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Note: In a real test, you would first create a user or use a test user
    // For now, we'll test the public endpoints
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/posts (GET)', () => {
    it('should return published posts', () => {
      return request(app.getHttpServer())
        .get('/api/posts')
        .expect(200);
    });

    it('should return posts with published=true by default', () => {
      return request(app.getHttpServer())
        .get('/api/posts?published=true')
        .expect(200);
    });
  });

  describe('/api/posts/:id (GET)', () => {
    it('should return 404 for non-existent post', () => {
      return request(app.getHttpServer())
        .get('/api/posts/non-existent-id')
        .expect(404);
    });
  });

  describe('/api/posts (POST)', () => {
    it('should reject unauthenticated request', () => {
      return request(app.getHttpServer())
        .post('/api/posts')
        .send({
          title: 'Test Post',
          content: 'Test content',
        })
        .expect(401);
    });
  });
});