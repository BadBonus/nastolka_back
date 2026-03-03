import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async generateAccessToken(userId: number): Promise<string> {
    return this.jwtService.signAsync(
      { userId },
      {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRES_IN'),
      },
    );
  }

  async generateRefreshToken(userId: number): Promise<string> {
    return this.jwtService.signAsync(
      { userId },
      {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES_IN'),
      },
    );
  }

  async generateTokens(
    userId: number,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return await Promise.all([
      this.generateAccessToken(userId),
      this.generateRefreshToken(userId),
    ]).then(([accessToken, refreshToken]) => ({ accessToken, refreshToken }));
  }

  async verifyToken(token: string) {
    try {
      const fb = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });
      return fb as { userId: number };
    } catch (err: unknown) {
      if (err instanceof TokenExpiredError)
        throw new UnauthorizedException('Срок действия токена истек');

      if (err instanceof JsonWebTokenError)
        throw new UnauthorizedException('Невалидный токен');

      throw new UnauthorizedException('Ошибка при проверке токена');
    }
  }
}
