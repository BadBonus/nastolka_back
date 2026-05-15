import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { TokenService } from '@/shared/token/token.service';
import { WEEK_IN_MS } from '@/utils/vars';
import type { TSucAuthFB } from '@shared/types';
import { Prisma } from '@pGen/browser';

type TSucAuthFBWithRefresh = TSucAuthFB & { refreshToken: string };
type TUserPayload = { id: number; email: string; nickname: string };

@Injectable()
export class SessionService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
  ) {}

  async createSession(user: TUserPayload, tx?: Prisma.TransactionClient) {
    const prisma = tx || this.prisma;
    const { accessToken, refreshToken } =
      await this.tokenService.generateTokens(user.id);

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + WEEK_IN_MS),
      },
    });

    return {
      refreshToken,
      accessToken,
    } as TSucAuthFBWithRefresh;
  }

  async findSession(refreshToken: string) {
    const ses = await this.prisma.session.findUnique({
      where: { refreshToken },
    });

    return ses;
  }

  async deleteSession(refreshToken: string) {
    return await this.prisma.session.delete({
      where: { refreshToken },
    });
  }

  async deleteAllUserSessions(userId: number) {
    return await this.prisma.session.deleteMany({
      where: { userId },
    });
  }

  async verifySession(oldRefreshToken: string) {
    await this.tokenService.verifyToken(oldRefreshToken);
    const savedSession = await this.findSession(oldRefreshToken);
    console.log('sss', savedSession);

    if (!savedSession) {
      throw new UnauthorizedException('Сессия не найдена');
    }

    if (new Date() > savedSession.expiresAt) {
      throw new UnauthorizedException('Срок действия сессии истек');
    }
  }

  async refreshTokens(oldRefreshToken: string) {
    await this.tokenService.verifyToken(oldRefreshToken);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const allSessions = await tx.session.findMany({
          select: { refreshToken: true },
        });
        console.log('Ищем токен:', oldRefreshToken);

        const deletedSession = await tx.session.delete({
          where: { refreshToken: oldRefreshToken },
        });

        const { accessToken, refreshToken: newRefreshToken } =
          await this.tokenService.generateTokens(deletedSession.userId);

        await tx.session.create({
          data: {
            userId: deletedSession.userId,
            refreshToken: newRefreshToken,
            expiresAt: new Date(Date.now() + WEEK_IN_MS),
          },
        });

        return {
          accessToken,
          refreshToken: newRefreshToken,
          userId: deletedSession.userId,
        };
      });
    } catch (error) {
      throw new UnauthorizedException('Сессия недействительна или истекла');
    }
  }
}
