import { Exclude, Expose, Type } from 'class-transformer';
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
import { EventOrgResponseDto } from './paginated-events.response.dto';

@Exclude()
export class EventDetailResponseDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  slug!: string;

  @ApiProperty()
  @Expose()
  orgId!: string;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  description!: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  addInfo!: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  preview!: string | null;

  @ApiProperty()
  @Expose()
  minUsers!: number;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  maxUsers!: number | null;

  @ApiProperty()
  @Expose()
  isBeginnerFriendly!: boolean;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  ageLimit!: number | null;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  costValue!: number | null;

  @ApiPropertyOptional({ enum: Currency, nullable: true })
  @Expose()
  costCurrency!: Currency | null;

  @ApiProperty({ enum: EventFormat })
  @Expose()
  format!: EventFormat;

  @ApiProperty({ enum: SessionType })
  @Expose()
  sessionType!: SessionType;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  address!: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  mapUrl!: string | null;

  @ApiProperty({ enum: EventStatus })
  @Expose()
  status!: EventStatus;

  @ApiProperty()
  @Expose()
  startsAt!: Date;

  @ApiProperty()
  @Expose()
  endsAt!: Date;

  @ApiProperty({ enum: GameGenres, isArray: true })
  @Expose()
  genres!: GameGenres[];

  @ApiProperty({ enum: GamePlatform, isArray: true })
  @Expose()
  platforms!: GamePlatform[];

  @ApiProperty({ enum: GameSystem })
  @Expose()
  gameSystem!: GameSystem;

  @ApiProperty({ type: EventOrgResponseDto })
  @Expose()
  @Type(() => EventOrgResponseDto)
  org!: EventOrgResponseDto;
}
