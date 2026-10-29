import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsBoolean,
  IsEnum,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  EventFormat,
  SessionType,
  Currency,
  GameGenres,
  GamePlatform,
  GameSystem,
} from '@pGen/client';
import { EVENT_PREVIEW_IMAGE_SIZE } from './../event.constants';
import { EventVenueDto } from './event-venue.dto';

export class CreateEventDtoReq {
  @ApiProperty()
  @IsString()
  orgId!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Краткий синопсис события (отдаётся только в detail by slug)',
  })
  @IsOptional()
  @IsString()
  synopsis?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addInfo?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description:
      'Аватар пользователя, размерность ' +
      EVENT_PREVIEW_IMAGE_SIZE[0] +
      'x' +
      EVENT_PREVIEW_IMAGE_SIZE[1] +
      ' пикселей',
  })
  @IsOptional()
  previewImage?: any;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  minUsers?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUsers?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isBeginnerFriendly?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  ageLimit?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  autoApprove?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  costValue?: number;

  @ApiPropertyOptional({ enum: Currency })
  @IsOptional()
  @IsEnum(Currency)
  costCurrency?: Currency;

  @ApiProperty({ enum: EventFormat })
  @IsEnum(EventFormat)
  format!: EventFormat;

  @ApiProperty({ enum: SessionType })
  @IsEnum(SessionType)
  sessionType!: SessionType;

  @ApiProperty({
    type: EventVenueDto,
    description:
      'Место проведения. type должен совпадать с format: ONLINE → links[]; OFFLINE → address, lat, lng, mapUrl?',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as unknown;
      } catch {
        return value;
      }
    }
    return value;
  })
  @ValidateNested()
  @Type(() => EventVenueDto)
  venue!: EventVenueDto;

  @ApiProperty()
  @IsDateString()
  startsAt!: string;

  @ApiProperty()
  @IsDateString()
  endsAt!: string;

  @ApiPropertyOptional({ enum: GameGenres, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(GameGenres, { each: true })
  genres?: GameGenres[];

  @ApiPropertyOptional({ enum: GamePlatform, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(GamePlatform, { each: true })
  platforms?: GamePlatform[];

  @ApiProperty({ enum: GameSystem })
  @IsEnum(GameSystem)
  gameSystem!: GameSystem;

  @ApiPropertyOptional({
    default: true,
    description:
      'Показывать блок места / онлайн-площадок незаписанным посетителям',
  })
  @IsOptional()
  @IsBoolean()
  showLocation?: boolean;

  @ApiPropertyOptional({
    default: true,
    description: 'Показывать блок материалов для игроков',
  })
  @IsOptional()
  @IsBoolean()
  showMaterials?: boolean;
}
