import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import type { Response, Request } from 'express';
import { REFRESH_TOKEN_NAME } from './utils';
import { WEEK_IN_MS } from '@/utils/vars';

const TEST_PASSWORD = 'password_123_123';
const TEST_EMAIL = 'test@test.com';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: DeepMockProxy<AuthService>;

  const mockResponse = () => {
    const res: Partial<Response> = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      getHeaders: jest.fn().mockReturnValue({}),
    };
    return res as Response;
  };

  const mockRequest = (
    cookies: Record<string, string> = {},
    user: any = {},
  ) => {
    return {
      cookies,
      user,
    } as unknown as Request & { user: any };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockDeep<AuthService>(),
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  describe('login', () => {
    it('успешная авторизация и установка cookie', async () => {
      const dto = { email: TEST_EMAIL, password: TEST_PASSWORD };
      const res = mockResponse();
      authService.login.mockResolvedValue({
        user: { id: 1, email: TEST_EMAIL } as any,
        accessToken: 'access',
        refreshToken: 'refresh',
      });

      const result = await controller.login(dto, res);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(res.cookie).toHaveBeenCalledWith(
        REFRESH_TOKEN_NAME,
        'refresh',
        expect.objectContaining({ maxAge: WEEK_IN_MS, httpOnly: true }),
      );
      expect(result).toHaveProperty('accessToken', 'access');
      expect(result).toHaveProperty('user');
    });
  });

  describe('register', () => {
    it('вызов сервиса регистрации с DTO', async () => {
      const dto = {
        email: 'test@test.com',
        password: TEST_PASSWORD,
        confirmPassword: TEST_PASSWORD,
        name: 'Test',
        nickname: 'test_user',
      };
      authService.register.mockResolvedValue(undefined as never);

      await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('verifyEmail', () => {
    it('успешная верификация и обновление cookie', async () => {
      const dto = { email: TEST_EMAIL, code: '123456' };
      const res = mockResponse();
      authService.verifyEmail.mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
        user: { id: 1, email: TEST_EMAIL } as any,
      });

      const result = await controller.verifyEmail(dto, res);

      expect(authService.verifyEmail).toHaveBeenCalledWith(dto);
      expect(res.cookie).toHaveBeenCalledWith(
        REFRESH_TOKEN_NAME,
        'refresh',
        expect.any(Object),
      );
      expect(result).toEqual({ accessToken: 'access' });
    });
  });

  describe('getMe', () => {
    it('получение данных пользователя', async () => {
      const req = mockRequest({}, { userId: 1 });
      authService.me.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
      } as any);

      const result = await controller.getMe(req);

      expect(authService.me).toHaveBeenCalledWith(1);
      expect(result).toHaveProperty('id', 1);
    });
  });

  describe('selfDelete', () => {
    it('удаление аккаунта и очистка cookie', async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();
      authService.deleteUser.mockResolvedValue(undefined);

      const result = await controller.selfDelete(req, res);

      expect(authService.deleteUser).toHaveBeenCalledWith(1);
      expect(res.clearCookie).toHaveBeenCalledWith(REFRESH_TOKEN_NAME);
      expect(result).toBe(true);
    });
  });

  describe('logout', () => {
    it('ошибка при отсутствии токена', async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await expect(controller.logout(req, res)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('успешный выход и очистка cookie', async () => {
      const req = mockRequest({ [REFRESH_TOKEN_NAME]: 'refresh' }, { id: 1 });
      const res = mockResponse();
      authService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(req, res);

      expect(authService.logout).toHaveBeenCalledWith(1, 'refresh');
      expect(res.clearCookie).toHaveBeenCalledWith(
        REFRESH_TOKEN_NAME,
        expect.any(Object),
      );
      expect(result).toEqual({ message: 'Успешный выход' });
    });
  });

  describe('refreshToken', () => {
    it('ошибка при отсутствии токена в cookie', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await expect(controller.refreshToken(req, res)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('очистка cookie при ошибке сервиса', async () => {
      const req = mockRequest({ [REFRESH_TOKEN_NAME]: 'invalid-refresh' });
      const res = mockResponse();
      authService.refreshTokens.mockRejectedValue(new Error('Invalid token'));

      await expect(controller.refreshToken(req, res)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(res.clearCookie).toHaveBeenCalledWith(
        REFRESH_TOKEN_NAME,
        expect.any(Object),
      );
    });

    it('успешное обновление токенов', async () => {
      const req = mockRequest({ [REFRESH_TOKEN_NAME]: 'old-refresh' });
      const res = mockResponse();
      const userData = { id: 1 } as any;

      authService.refreshTokens.mockResolvedValue({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        user: userData,
      });

      const result = await controller.refreshToken(req, res);

      expect(authService.refreshTokens).toHaveBeenCalledWith('old-refresh');
      expect(res.cookie).toHaveBeenCalledWith(
        REFRESH_TOKEN_NAME,
        'new-refresh',
        expect.any(Object),
      );
      expect(result).toEqual({ accessToken: 'new-access', user: userData });
    });
  });

  describe('resetPasswordRequest', () => {
    it('вызов запроса сброса пароля', async () => {
      const dto = { email: TEST_EMAIL };
      authService.resetPasswordRequest.mockResolvedValue(undefined as never);

      await controller.resetPasswordRequest(dto);

      expect(authService.resetPasswordRequest).toHaveBeenCalledWith(dto.email);
    });
  });

  describe('validateToken', () => {
    it('вызов валидации токена', async () => {
      const token = 'valid-token';
      authService.validateResetToken.mockResolvedValue({ valid: true });

      const result = await controller.validateToken(token);

      expect(authService.validateResetToken).toHaveBeenCalledWith(token);
      expect(result).toEqual({ valid: true });
    });
  });

  describe('confirmReset', () => {
    it('вызов подтверждения сброса пароля', async () => {
      const dto = { token: 'token', newPassword: TEST_PASSWORD };
      authService.resetPassword.mockResolvedValue(undefined as never);

      await controller.confirmReset(dto);

      expect(authService.resetPassword).toHaveBeenCalledWith(dto);
    });
  });
});
