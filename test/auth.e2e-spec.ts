import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Authentication (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply global pipes like in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    prismaService = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    const registerDto = {
      email: 'e2etest@example.com',
      name: 'E2E Test User',
      password: 'password123',
      phone: '1234567890',
    };

    beforeEach(async () => {
      // Clean up test user if exists
      await prismaService.user.deleteMany({
        where: { email: registerDto.email },
      });
    });

    it('should register a new user successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.message).toBe('User registered successfully');
          expect(res.body.data).toHaveProperty('user');
          expect(res.body.data).toHaveProperty('token');
          expect(res.body.data.user.email).toBe(registerDto.email);
          expect(res.body.data.user.name).toBe(registerDto.name);
          expect(res.body.data.user).not.toHaveProperty('password');
        });
    });

    it('should return 409 if email already exists', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      // Second registration with same email
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain('Email already registered');
        });
    });

    it('should return 400 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...registerDto,
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should return 400 for short password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...registerDto,
          password: '123',
        })
        .expect(400);
    });

    it('should return 400 for missing required fields', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: registerDto.email,
        })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    const testUser = {
      email: 'logintest@example.com',
      name: 'Login Test User',
      password: 'password123',
      phone: '1234567890',
    };

    beforeAll(async () => {
      // Register a test user for login tests
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);
    });

    afterAll(async () => {
      // Clean up test user
      await prismaService.user.deleteMany({
        where: { email: testUser.email },
      });
    });

    it('should login successfully with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.message).toBe('User logged in successfully');
          expect(res.body.data).toHaveProperty('user');
          expect(res.body.data).toHaveProperty('token');
          expect(res.body.data.user.email).toBe(testUser.email);
          expect(res.body.data.user).not.toHaveProperty('password');
        });
    });

    it('should return 401 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid credentials');
        });
    });

    it('should return 401 for invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid credentials');
        });
    });

    it('should return 400 for missing fields', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
        })
        .expect(400);
    });
  });

  describe('/auth/profile (GET)', () => {
    let authToken: string;
    const testUser = {
      email: 'profiletest@example.com',
      name: 'Profile Test User',
      password: 'password123',
    };

    beforeAll(async () => {
      // Register and login to get token
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      authToken = loginResponse.body.data.token;
    });

    afterAll(async () => {
      await prismaService.user.deleteMany({
        where: { email: testUser.email },
      });
    });

    it('should get user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.email).toBe(testUser.email);
          expect(res.body.data).not.toHaveProperty('password');
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should return 401 with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});