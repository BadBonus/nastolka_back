import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Currency,
  EventReview,
  GameGenres,
  GameSystem,
  OrgFormatMode,
} from '@pGen/client';

export class OrgCountryDto {
  @ApiProperty({ example: 630336 })
  geonameId!: number;

  @ApiProperty({ example: 'BY' })
  isoCode!: string;

  @ApiProperty({ example: 'Беларусь' })
  name!: string;
}

export class OrgCityDto {
  @ApiProperty({ example: 625144 })
  geonameId!: number;

  @ApiProperty({ example: 'Минск' })
  name!: string;
}

@Exclude()
export class OrgListResponseDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  slug!: string;

  @ApiProperty({ example: 'GameMaster' })
  @Expose()
  nickname!: string;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  description!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 1500 })
  @Expose()
  costValue!: number | null;

  @ApiPropertyOptional({ enum: Currency, nullable: true })
  @Expose()
  costCurrency!: Currency | null;

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

  @ApiProperty({ example: 'org@example.com' })
  @Expose()
  email!: string;

  @ApiProperty()
  @Expose()
  isBanned!: boolean;

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
}

export class OrgMeResponseDto extends OrgListResponseDto {
  @ApiProperty()
  @Expose()
  reviews!: EventReview[];
}
