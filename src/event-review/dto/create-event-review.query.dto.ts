import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KindOfRate } from '@pGen/enums';
import { MAX_RATES_PER_REVIEW } from '../event-review.constants';

export class CreateEventReviewDtoReq {
  @ApiProperty({ description: 'ID ивента', format: 'uuid' })
  @IsUUID()
  eventId!: string;

  @ApiPropertyOptional({ description: 'Текст обзора' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  comment?: string;

  @ApiPropertyOptional({
    description: 'Оценки атрибутов мастера',
    enum: KindOfRate,
    isArray: true,
    maxItems: MAX_RATES_PER_REVIEW,
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(MAX_RATES_PER_REVIEW)
  @IsEnum(KindOfRate, { each: true })
  rates?: KindOfRate[];
}
