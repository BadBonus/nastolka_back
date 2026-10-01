import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '@/common/dto';

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
