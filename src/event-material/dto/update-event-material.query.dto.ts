import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  EVENT_MATERIAL_MAX_BODY_LENGTH,
  EVENT_MATERIAL_MAX_TITLE_LENGTH,
} from '../event-material.constants';

export class UpdateEventMaterialDto {
  @ApiPropertyOptional({ maxLength: EVENT_MATERIAL_MAX_TITLE_LENGTH })
  @IsOptional()
  @IsString()
  @MaxLength(EVENT_MATERIAL_MAX_TITLE_LENGTH)
  title?: string;

  @ApiPropertyOptional({ maxLength: EVENT_MATERIAL_MAX_BODY_LENGTH })
  @IsOptional()
  @IsString()
  @MaxLength(EVENT_MATERIAL_MAX_BODY_LENGTH)
  body?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
