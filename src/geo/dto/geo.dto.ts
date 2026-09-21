import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';
import { BaseQueryDto, PaginationMetaDto } from '@/common/dto';

export class GeoCountriesQueryDto {
  @ApiPropertyOptional({
    description: 'ISO 3166-1 alpha-2 country code',
    example: 'BY',
  })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  isoCode?: string;

  @ApiPropertyOptional({ description: 'Поиск по русскому названию страны' })
  @IsOptional()
  @IsString()
  q?: string;
}

export class GeoCitiesQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: 'geonameId страны',
    example: 630336,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  countryId?: number;
}

export class CountryDto {
  @ApiProperty({ example: 630336 })
  geonameId!: number;

  @ApiProperty({ example: 'BY' })
  isoCode!: string;

  @ApiProperty({ example: 'Беларусь' })
  name!: string;
}

export class CityListItemDto {
  @ApiProperty({ example: 630468 })
  geonameId!: number;

  @ApiProperty({ example: 'Бобруйск' })
  name!: string;

  @ApiProperty({ example: 630336 })
  countryId!: number;
}

export class PaginatedCitiesResponseDto {
  @ApiProperty({ type: [CityListItemDto] })
  data!: CityListItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
