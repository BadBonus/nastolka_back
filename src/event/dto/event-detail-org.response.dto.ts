import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GameGenres, GameSystem } from '@pGen/client';
import { OrgCountryDto } from '@/org/dto/org-me.response.dto';
import { OrgRatingsResponseDto } from '@/org/dto/org-public.response.dto';

@Exclude()
export class EventDetailOrgResponseDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  nickname!: string;

  @ApiProperty()
  @Expose()
  slug!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  @Expose()
  avatar!: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  description!: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  soclinks!: unknown | null;

  @ApiProperty({ type: OrgCountryDto })
  @Expose()
  @Type(() => OrgCountryDto)
  country!: OrgCountryDto;

  @ApiProperty({ enum: GameSystem, enumName: 'GameSystem', isArray: true })
  @Expose()
  preferredSystems!: GameSystem[];

  @ApiProperty({ enum: GameGenres, enumName: 'GameGenres', isArray: true })
  @Expose()
  preferredGenres!: GameGenres[];

  @ApiProperty({
    description:
      'Количество завершённых сессий организатора (status = FINISHED)',
  })
  @Expose()
  gamesCount!: number;

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
