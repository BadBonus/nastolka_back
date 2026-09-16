import { ApiProperty } from '@nestjs/swagger';
import {
  EventFormat,
  SessionType,
  Currency,
  GameGenres,
  GameSystem,
  GamePlatform,
  EventStatus,
  SupportTicketStatus,
  RequestStatus,
  KindOfRate,
  ESocLinks,
} from '@shared/prisma/generated/client';

enum EtypesSort {
  'ASC' = 'asc',
  'DESC' = 'desc',
}

export class AppEnumsDto {
  @ApiProperty({ enum: Currency, enumName: 'Currency' })
  currency!: Currency;

  @ApiProperty({ enum: EventFormat, enumName: 'EventFormat' })
  eventFormat!: EventFormat;

  @ApiProperty({ enum: GameSystem, enumName: 'GameSystem' })
  gameSystem!: GameSystem;

  @ApiProperty({ enum: GamePlatform, enumName: 'GamePlatform' })
  gamePlatform!: GamePlatform;

  @ApiProperty({ enum: GameGenres, enumName: 'GameGenres' })
  gameGenres!: GameGenres;

  @ApiProperty({ enum: SessionType, enumName: 'SessionType' })
  sessionType!: SessionType;

  @ApiProperty({ enum: EventStatus, enumName: 'EventStatus' })
  eventStatus!: EventStatus;

  @ApiProperty({ enum: SupportTicketStatus, enumName: 'SupportTicketStatus' })
  supportTicketStatus!: SupportTicketStatus;

  @ApiProperty({ enum: RequestStatus, enumName: 'RequestStatus' })
  requestStatus!: RequestStatus;

  @ApiProperty({ enum: KindOfRate, enumName: 'KindOfRate' })
  kindOfRate!: KindOfRate;

  @ApiProperty({ enum: ESocLinks, enumName: 'ESocLinks' })
  socLinks!: ESocLinks;

  @ApiProperty({ enum: EtypesSort, enumName: 'EtypesSort' })
  typesOfSort!: EtypesSort;
}
