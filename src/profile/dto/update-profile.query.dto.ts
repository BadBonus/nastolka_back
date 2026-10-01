import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { PROFILE_AVATAR_SIZE } from './../profile.constants';

export class ScheduleIntervalDto {
  @ApiProperty({ description: 'День недели (1-7)', example: 1 })
  @IsInt()
  @Min(1)
  @Max(7)
  dayOfWeek!: number;

  @ApiProperty({ description: 'Время начала (в часах)', example: 8 })
  @IsInt()
  @Min(0)
  @Max(24)
  startTime!: number;

  @ApiProperty({ description: 'Время окончания (в часах)', example: 12 })
  @IsInt()
  @Min(0)
  @Max(24)
  endTime!: number;
}

export class UpdateProfileDto {
  // TODO: потом добавить DTO ника, но когда будет активна фича с платными никами

  @ApiPropertyOptional({ type: 'string', example: 'Иван Иванов' })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ type: 'string', example: 'О себе' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description:
      'Аватар пользователя, размерность ' +
      PROFILE_AVATAR_SIZE[0] +
      'x' +
      PROFILE_AVATAR_SIZE[1] +
      ' пикселей',
  })
  @IsOptional()
  avatar?: any;

  @ApiPropertyOptional({
    type: 'string',
    format: 'date-time',
    example: '1990-01-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  birthdate?: Date;

  @ApiPropertyOptional({ type: 'string', example: 'UTC' })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({
    type: 'string',
    description: 'JSON-строка с соцсетями',
    example: '{"VK": "https://vk.com/id1"}',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsObject()
  @IsOptional()
  soclinks?: Record<string, any>;

  @ApiPropertyOptional({
    type: [ScheduleIntervalDto],
    description: 'Массив интервалов расписания доступности',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    if (Array.isArray(value) && value.length === 0) {
      return undefined;
    }
    return value;
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleIntervalDto)
  schedules?: ScheduleIntervalDto[];
}
