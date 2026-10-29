import {
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsDateString,
  Max,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  GameSystem,
  EventFormat,
  SessionType,
  EventStatus,
} from '@pGen/client';
import { SortOrder } from '@/common/dto/base.query.dto';

export enum EventSortBy {
  STARTS_AT = 'startsAt',
  CREATED_AT = 'createdAt',
}

export class FilterEventsDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    default: 10,
    maximum: 50,
    description: 'Размер страницы (по умолчанию 10, максимум 50)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional({ enum: GameSystem })
  @IsOptional()
  @IsEnum(GameSystem)
  gameSystem?: GameSystem;

  @ApiPropertyOptional({ enum: EventFormat })
  @IsOptional()
  @IsEnum(EventFormat)
  format?: EventFormat;

  @ApiPropertyOptional({ enum: SessionType })
  @IsOptional()
  @IsEnum(SessionType)
  sessionType?: SessionType;

  @ApiPropertyOptional({
    enum: EventStatus,
    description: 'По умолчанию ACTIVE, если параметр не передан',
  })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    return value === 'true' || value === true;
  })
  @IsBoolean()
  isBeginnerFriendly?: boolean;

  @ApiPropertyOptional({
    description:
      'Только ивенты организаторов, на которых подписан текущий пользователь (нужен JWT)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    return value === 'true' || value === true;
  })
  @IsBoolean()
  subscribedOnly?: boolean;

  @ApiPropertyOptional({
    description: 'Только избранные ивенты текущего пользователя (нужен JWT)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    return value === 'true' || value === true;
  })
  @IsBoolean()
  favoriteOnly?: boolean;

  @ApiPropertyOptional({
    description: 'Нижняя граница startsAt (ISO 8601)',
    example: '2026-10-29T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Верхняя граница startsAt (ISO 8601)',
    example: '2026-10-29T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({
    description:
      'Только ещё не начавшиеся ивенты (startsAt >= now). По умолчанию true',
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    return value === 'true' || value === true;
  })
  @IsBoolean()
  upcomingOnly?: boolean;

  @ApiPropertyOptional({
    enum: EventSortBy,
    description: 'Поле сортировки',
    default: EventSortBy.STARTS_AT,
  })
  @IsOptional()
  @IsEnum(EventSortBy)
  sortBy?: EventSortBy;

  @ApiPropertyOptional({
    enum: SortOrder,
    description: 'Направление сортировки',
    default: SortOrder.ASC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;
}
