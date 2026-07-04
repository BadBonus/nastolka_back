import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  Length,
  IsDateString,
  IsObject,
  IsOptional,
} from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  avatar?: unknown;

  @IsDateString()
  @IsOptional()
  birthdate?: Date;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsObject()
  @IsOptional()
  soclinks?: Record<string, any>;
}
