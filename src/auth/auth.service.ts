import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException
} from '@nestjs/common';
import { PrismaService } from './../../src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/register.dto';
import type { TSucAuthFB } from '@/shared/types';
import type { User } from '@pGenTypes';
import { Prisma } from '@pGen/client';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import slugify from 'slugify';
import {WEEK_IN_MS} from "@/utils/vars";

type TSucAuthFBWithRefresh = TSucAuthFB & { refreshToken: string };

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async login(dto: LoginDto): Promise<TSucAuthFBWithRefresh> {
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

    return await this.prisma.$transaction(async (tx) => {
      const {accessToken, refreshToken} = await this.generateTokens(user.id, user.email);

      await tx.session.create({
        data: {
          userId: user.id,
          refreshToken: refreshToken,
          expiresAt: new Date(Date.now() + WEEK_IN_MS), 
        },
      });
      
      return {
        user: {
          id: user.id,
          nickname: user.nickname,
          email: user.email,
        },
        accessToken,
        refreshToken, // Контроллер заберет его и положит в куки
      } as TSucAuthFBWithRefresh;
    }) as TSucAuthFBWithRefresh;
  }

  async register(dto: RegisterDto): Promise<TSucAuthFBWithRefresh> {
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

        const {accessToken, refreshToken} = await this.generateTokens(newUser.id, email);

        await tx.session.create({
          data: {
            userId: newUser.id,
            refreshToken: refreshToken,
            expiresAt: new Date(Date.now() + WEEK_IN_MS),
          },
        });

        return {
          user: {
            id: newUser.id,
            nickname: newUser.nickname,
            email: newUser.email,
            slug: newUser.slug,
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

  private async generateTokens(userId: number, email: string) {
  const payload = { sub: userId, email };
  
  const [accessToken, refreshToken] = await Promise.all([
    this.jwtService.signAsync(payload, { expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRES_IN') }),
    this.jwtService.signAsync({ sub: userId }, { expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES_IN') }),
  ]);

  return { accessToken, refreshToken };
}
}
