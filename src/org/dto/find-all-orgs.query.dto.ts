import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { GameSystem, OrgFormatMode } from '@pGen/client';
import { BaseQueryDto } from '@/common/dto/base.query.dto';

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

  @ApiPropertyOptional({
    enum: OrgFormatMode,
    description:
      'ONLINE → ONLINE+HYBRID; OFFLINE → OFFLINE+HYBRID; без параметра — все',
  })
  @IsOptional()
  @IsEnum(OrgFormatMode)
  formatMode?: OrgFormatMode;

  @ApiPropertyOptional({ description: 'geonameId страны', example: 630336 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  countryId?: number;

  @ApiPropertyOptional({ description: 'geonameId города', example: 625144 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cityId?: number;
}
