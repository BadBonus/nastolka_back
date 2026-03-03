import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { SessionService } from '@/shared/session/session.service';
import { RegisterDto, LoginDto } from './dto/register.dto';
import { Prisma } from '@pGen/client';
import type { User } from '@pGenTypes';
import * as argon2 from 'argon2';
import slugify from 'slugify';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private sessionService: SessionService,
  ) {}

  async login(
    dto: LoginDto,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const account = await this.prisma.account.findUnique({
      where: {
        provider_idx: {
          provider: 'EMAIL',
          providerAccountId: dto.email,
        },
      },
      include: { user: true },
    });

    if (!account || !account.passwordHash) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    const isPasswordValid = await argon2.verify(
      account.passwordHash,
      dto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    const user = account.user;

    const { accessToken, refreshToken } =
      await this.sessionService.createSession({
        id: user.id,
        email: user.email,
        nickname: user.nickname,
      });

    return { user: account.user, accessToken, refreshToken };
  }

  async logout(refreshToken: string) {
    await this.sessionService.deleteSession(refreshToken);
  }

  async me(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nickname: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return user;
  }

  async refreshTokens(
    oldRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return await this.sessionService.refreshTokens(oldRefreshToken);
  }

  async register(dto: RegisterDto) {
    const { email, password, nickname } = dto;

    try {
      return await this.prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const existingUser = await tx.user.findUnique({ where: { email } });

          if (existingUser) {
            throw new ConflictException(
              'Пользователь с таким email уже существует',
            );
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

          await this.sessionService.createSession(
            {
              id: newUser.id,
              email: newUser.email,
              nickname: newUser.nickname,
            },
            tx,
          );
        },
      );
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new BadRequestException('Ошибка регистрации. Попробуйте позже.');
    }
  }

  async deleteUser(userId: number) {
    try {
      await this.prisma.user.delete({
        where: { id: userId }, //каскадное удаление сессий и аккаунтов настроено в Prisma
      });
    } catch (error) {
      throw new NotFoundException(`Пользователь с ID ${userId} не найден`);
    }
  }

  private async generateUniqueSlug(nickname: string): Promise<string> {
    const baseSlug = slugify(nickname, { lower: true, strict: true });

    const existingSlugs = await this.prisma.$queryRaw<{ slug: string }[]>`
      SELECT slug FROM users WHERE slug ~ ${'^' + baseSlug + '(-\\d+)?$'}
    `;

    if (existingSlugs.length === 0) {
      return baseSlug;
    }

    const usedNumbers = existingSlugs.map((row: any) => {
      const parts = row.slug.split('-');
      const lastPart = parts[parts.length - 1];
      return parseInt(lastPart) || 0;
    });

    const maxNumber = Math.max(...usedNumbers, 0);
    return `${baseSlug}-${maxNumber + 1}`;
  }
}
