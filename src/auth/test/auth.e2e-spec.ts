import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { MailService } from '@/auth/mail/mail.service';
import { REFRESH_TOKEN_NAME } from '@/auth/utils';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let container: StartedPostgreSqlContainer;
  let prisma: PrismaService;
  let accessToken: string;
  let refreshTokenCookie: string;

  const mailServiceMock = {
    sendVerificationCode: jest.fn(),
    sendPasswordResetLink: jest.fn(),
  };

  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    confirmPassword: 'password123',
    nickname: 'tester',
  };

  beforeAll(async () => {
    // Specify Postgres image to satisfy constructor signature
    container = await new PostgreSqlContainer('postgres:15-alpine').start();
    const dbUrl = container.getDatabase();

    process.env.DATABASE_URL = dbUrl;
    process.env.JWT_SECRET = 'test-secret';
    process.env.DEFAULT_USER_ROLE = 'USER';

    execSync('npx prisma db push --skip-generate', {
      env: { ...process.env, DATABASE_URL: dbUrl },
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailService)
      .useValue(mailServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    await prisma.role.create({
      data: { name: process.env.DEFAULT_USER_ROLE },
    });
  }, 60000);

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
    await container.stop();
  });

  describe('Аутентификация и регистрация', () => {
    it('/auth/register (POST) - успешная регистрация', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.text).toBe('Код подтверждения отправлен на почту');
      expect(mailServiceMock.sendVerificationCode).toHaveBeenCalledWith(
        testUser.email,
        expect.any(String),
      );
    });

    it('/auth/verify-email (POST) - успешное подтверждение', async () => {
      const verificationRecord = await prisma.verificationCode.findUnique({
        where: { email: testUser.email },
      });

      expect(verificationRecord).toBeDefined();

      const response = await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({
          email: testUser.email,
          code: verificationRecord!.code,
        })
        .expect(201);

      expect(response.body.accessToken).toBeDefined();

      const cookies = Array.isArray(response.headers['set-cookie'])
        ? response.headers['set-cookie']
        : ([response.headers['set-cookie']].filter(Boolean) as string[]);
      expect(cookies).toBeDefined();
      const refreshTokenSet = cookies.find((c: string) =>
        c.includes(REFRESH_TOKEN_NAME),
      );
      expect(refreshTokenSet).toBeDefined();
    });

    it('/auth/login (POST) - успешный вход', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email);

      accessToken = response.body.accessToken;

      const cookies = Array.isArray(response.headers['set-cookie'])
        ? response.headers['set-cookie']
        : ([response.headers['set-cookie']].filter(Boolean) as string[]);
      refreshTokenCookie = cookies.find((c: string) =>
        c.includes(REFRESH_TOKEN_NAME),
      );
      expect(refreshTokenCookie).toBeDefined();
    });

    it('/auth/me (GET) - получение профиля с токеном', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.email).toBe(testUser.email);
      expect(response.body.nickname).toBe(testUser.nickname);
    });

    it('/auth/me (GET) - отказ без токена', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });
  });
});
