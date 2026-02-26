import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException
} from '@nestjs/common';
import { PrismaService } from './../../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/register.dto';
import type { TSucRegAccFB } from './../shared/types';
import type { User } from '@pGenTypes';
import { Prisma } from '@pGen/client';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import slugify from 'slugify';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    // 1. Ищем аккаунт через наш составной индекс provider_idx
    const account = await this.prisma.account.findUnique({
      where: {
        provider_idx: {
          provider: 'EMAIL',
          providerAccountId: dto.email,
        },
      },
      include: { user: true }, // Подтягиваем данные юзера
    });

    if (!account || !account.passwordHash) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    // 2. Проверяем пароль
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      account.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    // 3. Возвращаем пользователя (без пароля)
    const userWithoutPassword = account.user;
    return userWithoutPassword;
  }

  async register(dto: RegisterDto) {
    const { email, password, nickname } = dto;

    try {
      return await this.prisma.$transaction(async (tx:Prisma.TransactionClient) => {
        const existingUser = await tx.user.findUnique({ where: { email } });

        if (existingUser) {
          throw new ConflictException('Пользователь с таким email уже существует');
        }

        const passwordHash = await argon2.hash(password);
        const slug = await this.generateUniqueSlug(nickname);
        const newUser = await tx.user.create({
          data: {
            nickname,
            email,
            slug,
          },
        });

        await tx.account.create({
          data: {
            userId: newUser.id,
            provider: 'EMAIL',
            providerAccountId: email,
            passwordHash,
          },
        });

        const accessToken = await this.jwtService.signAsync({ sub: newUser.id });
        const refreshToken = await this.jwtService.signAsync(
          { sub: newUser.id },
          { expiresIn: '7d' }, // Например, 7 дней для refresh
        );

        // 6. Сохраняем сессию
        await tx.session.create({
          data: {
            userId: newUser.id,
            refreshToken: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Совпадает с expiresIn
          },
        });

        return {
          user: {
            id: newUser.id,
            nickname: newUser.nickname,
            email: newUser.email,
          },
          accessToken,
          refreshToken, // Возвращаем для контроллера, чтобы он поставил куку
        };
      });
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new BadRequestException('Ошибка регистрации. Попробуйте позже.');
    }
  }

 private async generateUniqueSlug(nickname: string): Promise<string>{
    const baseSlug = slugify(nickname, { lower: true, strict: true });

    const existingSlugs = await this.prisma.$queryRaw<{ slug: string }[]>`
      SELECT slug FROM users WHERE slug ~ ${'^' + baseSlug + '(-\\d+)?$'}
    `;

    if (existingSlugs.length === 0) {
      return baseSlug;
    }

    const usedNumbers = existingSlugs.map((row:any) => {
      const parts = row.slug.split('-');
      const lastPart = parts[parts.length - 1];
      return parseInt(lastPart) || 0;
    });

    const maxNumber = Math.max(...usedNumbers, 0);
    return `${baseSlug}-${maxNumber + 1}`;
  }
}
