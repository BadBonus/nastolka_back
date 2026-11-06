import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CostFormat,
  Currency,
  GameGenres,
  GameSystem,
  OrgFormatMode,
} from '@pGen/client';
import { EventResponseDto } from '@/event/dto/paginated-events.response.dto';
import { ScheduleIntervalEntity } from '@/profile/dto/profile-user.response.dto';
import { OrgCityDto, OrgCountryDto } from './org-me.response.dto';

@Exclude()
export class OrgRatingsResponseDto {
  @ApiProperty({ example: 0 })
  @Expose()
  CREATIVITY!: number;

  @ApiProperty({ example: 0 })
  @Expose()
  STORYTELLING!: number;

  @ApiProperty({ example: 0 })
  @Expose()
  PLAYER_EDUCATION!: number;

  @ApiProperty({ example: 0 })
  @Expose()
  THEATRICALISE!: number;
}

@Exclude()
export class OrgPublicResponseDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  slug!: string;

  @ApiProperty({ example: 'GameMaster' })
  @Expose()
  nickname!: string;

  @ApiPropertyOptional({
    description:
      'HTML-описание организатора (санитизированный allowlist: p, h1–h4, ul, ol, li, hr, strong, em, s, mark)',
    example: '<p>Привет</p><mark style="background-color:#ffe42b">важно</mark>',
    nullable: true,
  })
  @Expose()
  description!: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  previewDescr!: string | null;

  @ApiPropertyOptional({
    description:
      'HTML-описание стиля игры (санитизированный allowlist: p, h1–h4, ul, ol, li, hr, strong, em, s, mark)',
    example: '<p>Привет</p><mark style="background-color:#ffe42b">важно</mark>',
    nullable: true,
  })
  @Expose()
  gameStyleDescr!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 1500 })
  @Expose()
  costValue!: number | null;

  @ApiPropertyOptional({ enum: Currency, nullable: true })
  @Expose()
  costCurrency!: Currency | null;

  @ApiProperty({
    enum: CostFormat,
    enumName: 'CostFormat',
    example: CostFormat.payment,
  })
  @Expose()
  costFormat!: CostFormat;

  @ApiPropertyOptional({ nullable: true, type: String })
  @Expose()
  avatar!: string | null;

  @ApiPropertyOptional({ example: 'UTC', nullable: true })
  @Expose()
  timezone!: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  soclinks!: unknown | null;

  @ApiProperty()
  @Expose()
  gameHistory!: unknown;

  @ApiProperty({
    type: () => [ScheduleIntervalEntity],
    description: 'Интервалы доступности организатора для игр',
  })
  @Type(() => ScheduleIntervalEntity)
  @Expose()
  schedules!: ScheduleIntervalEntity[];

  @ApiProperty({ enum: GameSystem, isArray: true })
  @Expose()
  preferredSystems!: GameSystem[];

  @ApiProperty({ enum: GameGenres, isArray: true })
  @Expose()
  preferredGenres!: GameGenres[];

  @ApiProperty({ enum: OrgFormatMode, example: OrgFormatMode.HYBRID })
  @Expose()
  formatMode!: OrgFormatMode;

  @ApiProperty({ type: OrgCountryDto })
  @Expose()
  @Type(() => OrgCountryDto)
  country!: OrgCountryDto;

  @ApiPropertyOptional({ type: OrgCityDto, nullable: true })
  @Expose()
  @Type(() => OrgCityDto)
  city!: OrgCityDto | null;

  @ApiProperty({ type: OrgRatingsResponseDto })
  @Expose()
  @Type(() => OrgRatingsResponseDto)
  ratings!: OrgRatingsResponseDto;

  @ApiProperty({
    description: 'Подписан ли текущий пользователь на организатора',
  })
  @Expose()
  isSubscribed!: boolean;

  @ApiProperty({
    type: [EventResponseDto],
    description: 'Ближайшие опубликованные ивенты организатора',
  })
  @Expose()
  @Type(() => EventResponseDto)
  upcomingEvents!: EventResponseDto[];
}
