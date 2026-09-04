import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type, Transform } from 'class-transformer';
import type { EventCreateWithoutReviewsInput } from '@pGen/models';
import {
  GameSystem,
  EventFormat,
  SessionType,
  GameGenres,
} from '@/shared/prisma/generated/enums';
import { IsOptional } from 'class-validator';
import { PaginationMetaDto } from '@common/dto';

export class EventOrgResponseDto {
  @ApiProperty()
  nickname!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ nullable: true, type: String })
  avatar!: string | null;
}

type TEventResponse = Pick<
  EventCreateWithoutReviewsInput,
  | 'name'
  | 'slug'
  | 'gameSystem'
  | 'format'
  | 'sessionType'
  | 'isBeginnerFriendly'
  | 'addInfo'
  | 'costValue'
  | 'startsAt'
  | 'maxUsers'
  | 'ageLimit'
  | 'endsAt'
  | 'genres'
  | 'minUsers'
> & { currentCountOfPlayers: number; org: EventOrgResponseDto };

export class EventResponseDto implements TEventResponse {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  gameSystem!: GameSystem;

  @ApiProperty()
  format!: EventFormat;

  @ApiProperty()
  sessionType!: SessionType;

  @ApiProperty()
  isBeginnerFriendly!: boolean;

  @ApiProperty()
  @IsOptional()
  addInfo?: string;

  @ApiProperty()
  @IsOptional()
  costValue?: number;

  @ApiProperty()
  startsAt!: Date;

  @ApiProperty()
  maxUsers!: number;

  @ApiProperty()
  @IsOptional()
  ageLimit?: number;

  @ApiProperty()
  endsAt!: Date;

  @ApiProperty()
  genres!: GameGenres[];

  @ApiProperty()
  minUsers!: number;

  @Expose()
  @Transform(({ obj }) => obj._count?.requests ?? 0)
  currentCountOfPlayers!: number;

  @ApiProperty({ type: EventOrgResponseDto })
  @Type(() => EventOrgResponseDto)
  org!: EventOrgResponseDto;

  @Exclude()
  _count?: any;
}

export class PaginatedEventsResponseDto {
  @ApiProperty({ type: [EventResponseDto] })
  data!: EventResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
