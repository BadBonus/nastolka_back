import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Currency, GameGenres, GameSystem, OrgFormatMode } from '@pGen/client';
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

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  description!: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  previewDescr!: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  gameStyleDescr!: string | null;

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
}
