import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';
import { getIoredisConnectionOptions } from '@/shared/redis/redis-connection';

const CONNECT_TOKEN_PREFIX = 'telegram:connect:';
const CONNECT_TOKEN_TTL_SECONDS = 5 * 60;

@Injectable()
export class TelegramConnectTokenService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis(getIoredisConnectionOptions(this.configService));
  }

  async createToken(userId: string): Promise<{ token: string; expiresIn: number }> {
    const token = randomUUID().replace(/-/g, '');
    await this.redis.set(
      `${CONNECT_TOKEN_PREFIX}${token}`,
      userId,
      'EX',
      CONNECT_TOKEN_TTL_SECONDS,
    );
    return { token, expiresIn: CONNECT_TOKEN_TTL_SECONDS };
  }

  async consumeToken(token: string): Promise<string | null> {
    const key = `${CONNECT_TOKEN_PREFIX}${token}`;
    const userId = await this.redis.get(key);
    if (!userId) {
      return null;
    }
    await this.redis.del(key);
    return userId;
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
