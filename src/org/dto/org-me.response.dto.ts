import type { OrgModel } from '@/shared/prisma/generated/models';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventFormat, GameGenres, GameSystem, EventReview } from '@pGen/client';

@Exclude()
export class OrgMeResponseDto implements Omit<
  OrgModel,
  'userId' | 'createdAt' | 'updatedAt'
> {
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

  @ApiProperty({ enum: EventFormat, isArray: true })
  @Expose()
  preferredFormats!: EventFormat[];

  @ApiProperty()
  @Expose()
  reviews!: EventReview[];
}
