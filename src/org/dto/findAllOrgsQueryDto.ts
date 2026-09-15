import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min, IsString } from 'class-validator';
import { GameSystem } from '@pGen/client';

export enum OrgSortBy {
  CREATED_AT = 'createdAt',
  EVENTS_COUNT = 'eventsCount',
  REVIEWS_COUNT = 'reviewsCount',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class FindAllOrgsQueryDto {
  @ApiPropertyOptional({ description: 'Поисковый запрос по никнейму' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Номер страницы', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Количество элементов на странице',
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    enum: OrgSortBy,
    description: 'Поле сортировки',
    default: OrgSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(OrgSortBy)
  sortBy?: OrgSortBy = OrgSortBy.CREATED_AT;

  @ApiPropertyOptional({
    enum: SortOrder,
    description: 'Направление сортировки',
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({ description: 'Минимальная стоимость' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minCost?: number;

  @ApiPropertyOptional({ description: 'Максимальная стоимость' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxCost?: number;

  @ApiPropertyOptional({
    description: 'Минимальное количество проведенных ивентов',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minEvents?: number;

  @ApiPropertyOptional({
    enum: GameSystem,
    isArray: true,
    description: 'Список предпочитаемых систем',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return [value];
    return value;
  })
  @IsEnum(GameSystem, { each: true })
  preferredSystems?: GameSystem[];
}
