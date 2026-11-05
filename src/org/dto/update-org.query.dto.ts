import {
  CostFormat,
  Currency,
  GameGenres,
  GameSystem,
  OrgFormatMode,
  Prisma,
} from '@pGen/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsObject,
  IsInt,
  IsEnum,
  IsArray,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { IsSoclinks } from '@/utils/decorators/is-soclinks.decorator';
import { ScheduleIntervalDto } from '@/profile/dto/update-profile.query.dto';
import { ORG_AVATAR_SIZE } from '../org.contants';
import { IsOrgScheduleSlots } from '../is-org-schedule-slots.decorator';

function parseFormEnumList(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  if (trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed) as unknown;
    } catch {
      return value;
    }
  }

  return [trimmed];
}

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
    description: 'Короткое описание для карточки',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  previewDescr?: string | null;

  @ApiPropertyOptional({
    description: 'Описание стиля игры',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  gameStyleDescr?: string | null;

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
    enum: CostFormat,
    enumName: 'CostFormat',
    description: 'Формат стоимости: payment или donate',
    example: CostFormat.payment,
  })
  @IsOptional()
  @IsEnum(CostFormat)
  costFormat?: CostFormat;

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
      INSTAGRAM: 'https://instagram.com/org',
      YOUTUBE: 'https://youtube.com/@org',
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
    description: 'Режим проведения: HYBRID, ONLINE, OFFLINE',
  })
  @IsOptional()
  @IsEnum(OrgFormatMode)
  formatMode?: OrgFormatMode;

  @ApiPropertyOptional({
    enum: GameSystem,
    isArray: true,
    description:
      'JSON-строка массива предпочитаемых систем. Полная замена списка',
    example: '["DUNGEONS_AND_DRAGONS_5E"]',
  })
  @Transform(({ value }): unknown => parseFormEnumList(value))
  @ValidateIf((_, value) => value !== undefined)
  @IsArray()
  @IsEnum(GameSystem, { each: true })
  preferredSystems?: GameSystem[];

  @ApiPropertyOptional({
    enum: GameGenres,
    isArray: true,
    description:
      'JSON-строка массива предпочитаемых жанров. Полная замена списка',
    example: '["FANTASY"]',
  })
  @Transform(({ value }): unknown => parseFormEnumList(value))
  @ValidateIf((_, value) => value !== undefined)
  @IsArray()
  @IsEnum(GameGenres, { each: true })
  preferredGenres?: GameGenres[];

  @ApiPropertyOptional({
    description: 'geonameId страны',
    example: 630336,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  countryId?: number;

  @ApiPropertyOptional({
    description: 'geonameId города (обязателен для HYBRID/OFFLINE)',
    example: 625144,
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === undefined
      ? undefined
      : value === null
        ? null
        : Number(value),
  )
  @IsInt()
  @Min(1)
  cityId?: number | null;

  @ApiPropertyOptional({
    type: [ScheduleIntervalDto],
    description:
      'JSON-строка массива интервалов доступности. Полная замена списка. Допустимые слоты: 8–12, 12–17, 17–22, 22–8',
    example: '[{"dayOfWeek":1,"startTime":8,"endTime":12}]',
  })
  @Transform(({ value }): unknown => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as unknown;
      } catch {
        return value;
      }
    }
    return value;
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleIntervalDto)
  @IsOrgScheduleSlots()
  schedules?: ScheduleIntervalDto[];
}
