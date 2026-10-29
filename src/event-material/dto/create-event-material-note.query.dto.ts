import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  EVENT_MATERIAL_MAX_BODY_LENGTH,
  EVENT_MATERIAL_MAX_TITLE_LENGTH,
} from '../event-material.constants';

export class CreateEventMaterialNoteDtoReq {
  @ApiProperty({ maxLength: EVENT_MATERIAL_MAX_TITLE_LENGTH })
  @IsString()
  @MaxLength(EVENT_MATERIAL_MAX_TITLE_LENGTH)
  title!: string;

  @ApiProperty({ maxLength: EVENT_MATERIAL_MAX_BODY_LENGTH })
  @IsString()
  @MaxLength(EVENT_MATERIAL_MAX_BODY_LENGTH)
  body!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
