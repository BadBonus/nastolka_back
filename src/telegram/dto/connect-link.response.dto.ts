import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class TelegramConnectLinkResponseDto {
  @ApiProperty({ description: 'Deep-link для привязки Telegram' })
  @Expose()
  url!: string;

  @ApiProperty({ description: 'TTL токена в секундах' })
  @Expose()
  expiresIn!: number;
}
