import { Prisma } from '@pGen/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsObject,
} from 'class-validator';
import { ORG_AVATAR_SIZE } from '../org.contants';

// dto/update-org.dto.ts
export class UpdateOrgDto {
  @ApiProperty({
    description: 'Отображаемое имя организатора',
    example: 'GameMaster',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  nickname!: string;

  @ApiProperty({
    description: 'Email организатора',
    example: 'org@example.com',
  })
  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiPropertyOptional({ description: 'Описание организатора', nullable: true })
  @IsString()
  @IsOptional()
  description!: string | null;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description:
      'Аватар организатора, размерность ' +
      ORG_AVATAR_SIZE[0] +
      'x' +
      ORG_AVATAR_SIZE[1] +
      ' пикселей',
  })
  @IsOptional()
  avatar?: any;

  @ApiPropertyOptional({
    description: 'Объект ссылок на соцсети',
    nullable: true,
  })
  @IsObject()
  @IsOptional()
  soclinks!: Prisma.JsonValue | undefined | null;

  @ApiPropertyOptional({ type: 'string', example: 'UTC' })
  @IsString()
  @IsOptional()
  timezone!: string;
}
