import { ConfigService } from '@nestjs/config';
import type { ConnectionOptions } from 'bullmq';
import type { RedisOptions } from 'ioredis';

export function getRedisConnectionOptions(
  configService: ConfigService,
): ConnectionOptions {
  const username = configService.get<string>('REDIS_USERNAME');
  const password = configService.get<string>('REDIS_PASSWORD');

  return {
    host: configService.get<string>('REDIS_HOST', 'localhost'),
    port: Number(configService.get<string>('REDIS_PORT', '6380')),
    ...(username ? { username } : {}),
    ...(password ? { password } : {}),
    maxRetriesPerRequest: null,
  };
}

export function getIoredisConnectionOptions(
  configService: ConfigService,
): RedisOptions {
  return getRedisConnectionOptions(configService) as RedisOptions;
}
