import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { KindOfRate } from '@pGen/enums';
import { MAX_RATES_PER_REVIEW } from '../event-review.constants';

export class UpdateEventReviewDto {
  @ApiPropertyOptional({ description: 'Текст обзора', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  comment?: string | null;

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
