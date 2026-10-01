import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  EventFormat,
  SessionType,
  Currency,
  GameGenres,
  GamePlatform,
  GameSystem,
  EventStatus,
} from '@pGen/client';

class EventCountDto {
  @ApiProperty({ description: 'Количество подтвержденных участников' })
  requests!: number;
}

export class EventResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  org_id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  add_info?: string;

  @ApiPropertyOptional()
  preview_url?: string;

  @ApiProperty()
  min_users!: number;

  @ApiPropertyOptional()
  max_users?: number;

  @ApiProperty()
  is_beginner_friendly!: boolean;

  @ApiPropertyOptional()
  age_limit?: number;

  @ApiProperty()
  auto_approve!: boolean;

  @ApiPropertyOptional()
  cost_value?: number;

  @ApiPropertyOptional({ enum: Currency })
  cost_currency?: Currency;

  @ApiProperty({ enum: EventFormat })
  format!: EventFormat;

  @ApiProperty({ enum: SessionType })
  session_type!: SessionType;

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional()
  map_url?: string;

  @ApiProperty({ enum: EventStatus })
  status!: EventStatus;

  @ApiProperty()
  starts_at!: Date;

  @ApiProperty()
  ends_at!: Date;

  @ApiPropertyOptional()
  canceled_at?: Date;

  @ApiPropertyOptional()
  cancel_reason?: string;

  @ApiProperty()
  created_at!: Date;

  @ApiProperty()
  updated_at!: Date;

  @ApiPropertyOptional({ enum: GameGenres, isArray: true })
  genres?: GameGenres[];

  @ApiPropertyOptional({ enum: GamePlatform, isArray: true })
  platforms?: GamePlatform[];

  @ApiProperty({ enum: GameSystem })
  game_system!: GameSystem;

  @ApiPropertyOptional({ type: EventCountDto })
  _count?: EventCountDto;
}
