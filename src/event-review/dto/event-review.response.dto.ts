import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { KindOfRate } from '@pGen/enums';
import { PaginationMetaDto } from '@/common/dto';

@Exclude()
export class EventReviewAuthorDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  slug!: string;

  @ApiProperty()
  @Expose()
  nickname!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  @Expose()
  avatar!: string | null;
}

@Exclude()
export class EventReviewResponseDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  @Expose()
  comment!: string | null;

  @ApiProperty({ enum: KindOfRate, isArray: true })
  @Expose()
  rates!: KindOfRate[];

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty({ type: EventReviewAuthorDto })
  @Expose()
  @Type(() => EventReviewAuthorDto)
  author!: EventReviewAuthorDto;
}

export class PaginatedEventReviewsResponseDto {
  @ApiProperty({ type: [EventReviewResponseDto] })
  data!: EventReviewResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
