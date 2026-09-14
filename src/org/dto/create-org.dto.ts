import { Currency, Org, Prisma } from '@pGen/client';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsObject,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ORG_AVATAR_SIZE } from './../org.contants';

type CreateOrgFields = Pick<
  Org,
  'nickname' | 'description' | 'soclinks' | 'email' | 'timezone'
> &
  Partial<Pick<Org, 'costValue' | 'costCurrency'>>;

export class CreateOrgDtoReq implements CreateOrgFields {
  @ApiProperty({
    description: 'Отображаемое имя организатора',
    example: 'GameMaster',
  })
  @IsString()
  @IsNotEmpty()
  nickname!: string;

  @ApiProperty({
    description: 'Email организатора',
    example: 'org@example.com',
  })
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
