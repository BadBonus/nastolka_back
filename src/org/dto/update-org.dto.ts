import { Currency, Prisma } from '@pGen/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsObject,
  IsInt,
  IsEnum,
  Min,
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
    description: 'Стоимость услуг организатора',
    example: 1500,
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : Number(value),
  )
  @IsInt()
  @Min(0)
  costValue?: number | null;

  @ApiPropertyOptional({
    description: 'Валюта стоимости услуг организатора',
    enum: Currency,
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsEnum(Currency)
  costCurrency?: Currency | null;

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
