import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async generateAccessToken(userId: number) {
    return this.jwtService.signAsync({ userId }, { expiresIn: '15m' });
  }

  // Генерируем Refresh Token
  async generateRefreshToken(userId: number) {
    return this.jwtService.signAsync({ userId }, { expiresIn: '7d' });
  }

  // Проверка токена
  async verifyToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return payload as { userId: number };
    } catch (err) {
      // Вместо null в NestJS принято выбрасывать исключения,
      // но если тебе удобнее null — оставляем так
      return null;
    }
  }
}
