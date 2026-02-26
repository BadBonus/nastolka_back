import { Test, TestingModule } from '@nestjs/testing'; // Правильный импорт
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, BadRequestException } from '@nestjs/common';

const fake_jwt_token = 'fake_jwt_token';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockTx = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    account: {
      create: jest.fn(),
    },
    session: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            // Эмулируем работу транзакции: просто передаем наш мок в колбэк
            $transaction: jest.fn().mockImplementation((cb) => cb(mockTx)),
            // Если в методе используется прямой вызов queryRaw для слага
            $queryRaw: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue(fake_jwt_token),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'strongPassword123',
      nickname: 'tester',
    };

    it('should successfully register a user', async () => {
      // 1. Настраиваем моки
      mockTx.user.findUnique.mockResolvedValue(null); // Пользователь не найден
      mockTx.user.create.mockResolvedValue({
        id: 'uuid-123',
        email: registerDto.email,
        nickname: registerDto.nickname,
        slug: 'tester',
      });

      // 2. Вызываем метод
      const result = await service.register(registerDto);

      // 3. Проверки
      expect(result.user.email).toBe(registerDto.email);
      expect(result.accessToken).toBe(fake_jwt_token);
      expect(mockTx.user.create).toHaveBeenCalled();
      expect(mockTx.account.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          provider: 'EMAIL',
          providerAccountId: registerDto.email,
        }),
      });
    });

    it('should throw ConflictException if user exists', async () => {
      // Имитируем найденного пользователя
      mockTx.user.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });
});