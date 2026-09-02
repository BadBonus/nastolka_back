import { ApiProperty } from '@nestjs/swagger';
import {
  EventFormat,
  SessionType,
  Currency,
  GameGenres,
  GameSystem,
  GamePlatform,
} from '@pGen/client';

export class DictionariesDtoRes {
  @ApiProperty({ enum: EventFormat, isArray: true })
  eventFormats!: EventFormat[];

  @ApiProperty({ enum: SessionType, isArray: true })
  sessionTypes!: SessionType[];

  @ApiProperty({ enum: Currency, isArray: true })
  currencies!: Currency[];

  @ApiProperty({ enum: GameGenres, isArray: true })
  gameGenres!: GameGenres[];

  @ApiProperty({ enum: GameSystem, isArray: true })
  gameSystems!: GameSystem[];

  @ApiProperty({ enum: GamePlatform, isArray: true })
  gamePlatforms!: GamePlatform[];
}
