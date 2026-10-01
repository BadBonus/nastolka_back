import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';
import { BaseQueryDto } from '@/common/dto';

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
