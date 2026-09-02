import { Injectable } from '@nestjs/common';
import {
  EventFormat,
  SessionType,
  Currency,
  GameGenres,
  GameSystem,
  GamePlatform,
} from '@pGen/client';
import { DictionariesDtoRes } from './dto/dictionaries.dto';

@Injectable()
export class DictionaryService {
  getDictionaries(): DictionariesDtoRes {
    return {
      eventFormats: Object.values(EventFormat),
      sessionTypes: Object.values(SessionType),
      currencies: Object.values(Currency),
      gameGenres: Object.values(GameGenres),
      gameSystems: Object.values(GameSystem),
      gamePlatforms: Object.values(GamePlatform),
    };
  }
}
