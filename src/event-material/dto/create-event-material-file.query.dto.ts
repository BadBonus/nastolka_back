import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EVENT_MATERIAL_MAX_TITLE_LENGTH } from '../event-material.constants';

export class CreateEventMaterialFileDtoReq {
  @ApiProperty({ maxLength: EVENT_MATERIAL_MAX_TITLE_LENGTH })
  @IsString()
  @MaxLength(EVENT_MATERIAL_MAX_TITLE_LENGTH)
  title!: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Файл материала (до 2 MB)',
  })
  @IsOptional()
  file?: any;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (value === true || value === 'true' || value === '1') return true;
    if (value === false || value === 'false' || value === '0') return false;
    return value;
  })
  @IsBoolean()
  isPublic?: boolean;
}
