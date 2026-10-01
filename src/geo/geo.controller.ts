import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GeoService } from './geo.service';
import { GeoCitiesQueryDto, GeoCountriesQueryDto } from './dto/geo.query.dto';
import { CountryDto, PaginatedCitiesResponseDto } from './dto/geo.response.dto';

@ApiTags('Geo')
@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Get('countries')
  @ApiOperation({ summary: 'Список стран (без городов, название на русском)' })
  @ApiOkResponse({ type: [CountryDto] })
  findCountries(@Query() query: GeoCountriesQueryDto): Promise<CountryDto[]> {
    return this.geoService.findCountries(query);
  }

  @Get('cities')
  @ApiOperation({ summary: 'Список городов по countryId (пагинация, q)' })
  @ApiOkResponse({ type: PaginatedCitiesResponseDto })
  findCities(@Query() query: GeoCitiesQueryDto) {
    return this.geoService.findCities(query);
  }
}
