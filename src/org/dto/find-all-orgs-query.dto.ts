import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min, IsString } from 'class-validator';
import { GameSystem } from '@pGen/client';
import { BaseQueryDto } from '@/common/dto/base-query.dto';

export enum OrgSortBy {
  CREATED_AT = 'createdAt',
  EVENTS_COUNT = 'eventsCount',
  REVIEWS_COUNT = 'reviewsCount',
}

export class FindAllOrgsQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({
    enum: OrgSortBy,
    description: 'Поле сортировки',
    default: OrgSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(OrgSortBy)
  sortBy?: OrgSortBy = OrgSortBy.CREATED_AT;

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
