import { Currency, Org, OrgFormatMode, Prisma } from '@pGen/client';
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
import { Transform, Type } from 'class-transformer';
import { IsSoclinks } from '@/utils/decorators/is-soclinks.decorator';
import { IsOrgRichHtml } from '@/utils/decorators/is-org-rich-html.decorator';
import { ORG_AVATAR_SIZE, ORG_RICH_TEXT_MAX_VISIBLE } from '../org.contants';

type CreateOrgFields = Pick<
  Org,
  'nickname' | 'description' | 'soclinks' | 'email' | 'timezone'
> &
  Partial<Pick<Org, 'costValue' | 'costCurrency' | 'formatMode' | 'cityId'>> &
  Pick<Org, 'countryId'>;

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

  @ApiPropertyOptional({
    description:
      `Описание организатора. HTML-текст. Разрешены теги: p, h1–h4, ul, ol, li, hr, strong, em, s, mark ` +
      `(mark только со style background-color:#ffe42b). ` +
      `Видимый текст — не более ${ORG_RICH_TEXT_MAX_VISIBLE} символов. ` +
      `Пустое значение сохраняется как null.`,
    example: '<p>Привет</p><mark style="background-color:#ffe42b">важно</mark>',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @IsOrgRichHtml()
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
    description:
      'Объект ссылок на соцсети (VK, TELEGRAM, DISCORD, INSTAGRAM, REDDIT, YOUTUBE, THREADS)',
    example: {
      VK: 'https://vk.com/club1',
      TELEGRAM: 'https://t.me/org',
      THREADS: 'https://www.threads.net/@org',
    },
    nullable: true,
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
  @IsSoclinks()
  @IsOptional()
  soclinks!: Prisma.JsonValue | undefined | null;

  @ApiPropertyOptional({ type: 'string', example: 'UTC' })
  @IsString()
  @IsOptional()
  timezone!: string;

  @ApiPropertyOptional({
    enum: OrgFormatMode,
    default: OrgFormatMode.HYBRID,
    description: 'Режим проведения: HYBRID (по умолчанию), ONLINE, OFFLINE',
  })
  @IsOptional()
  @IsEnum(OrgFormatMode)
  formatMode?: OrgFormatMode;

  @ApiProperty({
    description: 'geonameId страны',
    example: 630336,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  countryId!: number;

  @ApiPropertyOptional({
    description: 'geonameId города (обязателен для HYBRID/OFFLINE)',
    example: 625144,
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : Number(value),
  )
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cityId?: number | null;
}
