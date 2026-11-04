import { Exclude, Expose, Type } from 'class-transformer';
import {
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  EventFormat,
  SessionType,
  Currency,
  GameGenres,
  GamePlatform,
  GameSystem,
  EventStatus,
} from '@pGen/client';
import {
  EventMaterialFileResponseDto,
  EventMaterialNoteResponseDto,
  EventMaterialResponseDto,
} from '@/event-material/dto';
import { EventResponseDto } from './paginated-events.response.dto';
import { EventDetailOrgResponseDto } from './event-detail-org.response.dto';
import {
  EventVenueOfflineDto,
  EventVenueOnlineDto,
} from './event-venue.dto';

@ApiExtraModels(
  EventMaterialFileResponseDto,
  EventMaterialNoteResponseDto,
  EventVenueOnlineDto,
  EventVenueOfflineDto,
  EventResponseDto,
)
@Exclude()
export class EventDetailResponseDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  slug!: string;

  @ApiProperty()
  @Expose()
  orgId!: string;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  description!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Краткий синопсис события',
  })
  @Expose()
  synopsis!: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  addInfo!: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  preview!: string | null;

  @ApiProperty()
  @Expose()
  minUsers!: number;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  maxUsers!: number | null;

  @ApiProperty({
    description: 'Число игроков с заявкой CONFIRMED',
  })
  @Expose()
  currentCountOfPlayers!: number;

  @ApiProperty()
  @Expose()
  isBeginnerFriendly!: boolean;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  ageLimit!: number | null;

  @ApiPropertyOptional({ nullable: true })
  @Expose()
  costValue!: number | null;

  @ApiPropertyOptional({
    enum: Currency,
    enumName: 'Currency',
    nullable: true,
  })
  @Expose()
  costCurrency!: Currency | null;

  @ApiProperty({ enum: EventFormat, enumName: 'EventFormat' })
  @Expose()
  format!: EventFormat;

  @ApiProperty({ enum: SessionType, enumName: 'SessionType' })
  @Expose()
  sessionType!: SessionType;

  @ApiPropertyOptional({
    nullable: true,
    description:
      'Место проведения (ONLINE links | OFFLINE geo). null если showLocation=false и зритель не записан/не владелец',
    oneOf: [
      { $ref: getSchemaPath(EventVenueOnlineDto) },
      { $ref: getSchemaPath(EventVenueOfflineDto) },
    ],
    discriminator: {
      propertyName: 'type',
      mapping: {
        ONLINE: getSchemaPath(EventVenueOnlineDto),
        OFFLINE: getSchemaPath(EventVenueOfflineDto),
      },
    },
  })
  @Expose()
  venue!: EventVenueOnlineDto | EventVenueOfflineDto | null;

  @ApiProperty({
    description:
      'Показывать блок места незаписанным посетителям (владелец и CONFIRMED видят venue всегда)',
  })
  @Expose()
  showLocation!: boolean;

  @ApiProperty({
    description:
      'Показывать блок материалов. false → materials всегда []',
  })
  @Expose()
  showMaterials!: boolean;

  @ApiProperty({ enum: EventStatus, enumName: 'EventStatus' })
  @Expose()
  status!: EventStatus;

  @ApiProperty()
  @Expose()
  startsAt!: Date;

  @ApiProperty()
  @Expose()
  endsAt!: Date;

  @ApiProperty({ enum: GameGenres, enumName: 'GameGenres', isArray: true })
  @Expose()
  genres!: GameGenres[];

  @ApiProperty({
    enum: GamePlatform,
    enumName: 'GamePlatform',
    isArray: true,
    description: 'Теги платформ (не путать с venue.links)',
  })
  @Expose()
  platforms!: GamePlatform[];

  @ApiProperty({ enum: GameSystem, enumName: 'GameSystem' })
  @Expose()
  gameSystem!: GameSystem;

  @ApiProperty({ type: EventDetailOrgResponseDto })
  @Expose()
  @Type(() => EventDetailOrgResponseDto)
  org!: EventDetailOrgResponseDto;

  @ApiProperty({
    description: 'В избранном у текущего пользователя (для гостя всегда false)',
  })
  @Expose()
  isFavorite!: boolean;

  @ApiProperty({
    description:
      'Материалы для игроков. Приватные (isPublic=false) видны только записанным (CONFIRMED) и организатору',
    type: 'array',
    items: {
      oneOf: [
        { $ref: getSchemaPath(EventMaterialFileResponseDto) },
        { $ref: getSchemaPath(EventMaterialNoteResponseDto) },
      ],
    },
  })
  @Expose()
  @Type(() => EventMaterialResponseDto)
  materials!: EventMaterialResponseDto[];

  @ApiProperty({
    type: [EventResponseDto],
    maxItems: 3,
    description: 'Похожие ACTIVE ивенты (до 3)',
  })
  @Expose()
  @Type(() => EventResponseDto)
  similar!: EventResponseDto[];
}
