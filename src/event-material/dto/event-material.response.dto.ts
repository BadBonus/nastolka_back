import { Exclude, Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventMaterialType } from '@pGen/client';

@Exclude()
export class EventMaterialFileResponseDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty({ enum: [EventMaterialType.FILE] })
  @Expose()
  type!: 'FILE';

  @ApiProperty()
  @Expose()
  title!: string;

  @ApiProperty()
  @Expose()
  sortOrder!: number;

  @ApiProperty()
  @Expose()
  isPublic!: boolean;

  @ApiProperty()
  @Expose()
  originalName!: string;

  @ApiProperty()
  @Expose()
  mimeType!: string;

  @ApiProperty()
  @Expose()
  sizeBytes!: number;

  @ApiProperty({ description: 'Публичный URL файла' })
  @Expose()
  url!: string;
}

@Exclude()
export class EventMaterialNoteResponseDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty({ enum: [EventMaterialType.NOTE] })
  @Expose()
  type!: 'NOTE';

  @ApiProperty()
  @Expose()
  title!: string;

  @ApiProperty()
  @Expose()
  sortOrder!: number;

  @ApiProperty()
  @Expose()
  isPublic!: boolean;

  @ApiProperty()
  @Expose()
  body!: string;
}

@Exclude()
export class EventMaterialResponseDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty({ enum: EventMaterialType })
  @Expose()
  type!: EventMaterialType;

  @ApiProperty()
  @Expose()
  title!: string;

  @ApiProperty()
  @Expose()
  sortOrder!: number;

  @ApiProperty()
  @Expose()
  isPublic!: boolean;

  @ApiPropertyOptional()
  @Expose()
  originalName?: string;

  @ApiPropertyOptional()
  @Expose()
  mimeType?: string;

  @ApiPropertyOptional()
  @Expose()
  sizeBytes?: number;

  @ApiPropertyOptional({ description: 'Публичный URL файла (только FILE)' })
  @Expose()
  url?: string;

  @ApiPropertyOptional({ description: 'Текст заметки (только NOTE)' })
  @Expose()
  body?: string;
}
