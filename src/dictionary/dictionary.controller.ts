import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DictionaryService } from './dictionary.service';
import { DictionariesDtoRes } from './dto/dictionaries.dto';

@ApiTags('Dictionaries')
@Controller('dictionaries')
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Get()
  @ApiOperation({ summary: 'Получение всех справочников и конфигураций' })
  @ApiResponse({
    status: 200,
    description: 'Объект со списками всех системных enum',
    type: DictionariesDtoRes,
  })
  getDictionaries(): DictionariesDtoRes {
    return this.dictionaryService.getDictionaries();
  }
}
