import { Injectable } from '@nestjs/common';
import { Prisma } from '@pGen/client';
import { PrismaService } from '@/prisma/prisma.service';
import { AVERAGE_PAGES_LIMIT } from '@/common/constants/index';
import { PaginationMetaDto } from '@/common/dto';
import {
  CityListItemDto,
  CountryDto,
  GeoCitiesQueryDto,
  GeoCountriesQueryDto,
} from './dto/geo.dto';

@Injectable()
export class GeoService {
  constructor(private readonly prisma: PrismaService) {}

  async findCountries(query: GeoCountriesQueryDto): Promise<CountryDto[]> {
    const isoCode = query.isoCode?.toUpperCase();
    const q = query.q?.trim();

    return this.prisma.country.findMany({
      where: {
        ...(isoCode ? { isoCode } : {}),
        ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
      },
      orderBy: { name: 'asc' },
      select: {
        geonameId: true,
        isoCode: true,
        name: true,
      },
    });
  }

  async findCities(query: GeoCitiesQueryDto): Promise<{
    data: CityListItemDto[];
    meta: PaginationMetaDto;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? AVERAGE_PAGES_LIMIT;
    const q = query.q?.trim();

    const where: Prisma.CityWhereInput = {
      ...(query.countryId ? { countryId: query.countryId } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              {
                alternateNames: {
                  some: { name: { contains: q, mode: 'insensitive' } },
                },
              },
            ],
          }
        : {}),
    };

    const [total, cities] = await this.prisma.$transaction([
      this.prisma.city.count({ where }),
      this.prisma.city.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          geonameId: true,
          name: true,
          countryId: true,
          alternateNames: {
            where: { lang: 'ru' },
            orderBy: [{ isPreferredName: 'desc' }, { name: 'asc' }],
            select: { name: true, isPreferredName: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 0;

    return {
      data: cities.map((city) => ({
        geonameId: city.geonameId,
        name: city.alternateNames[0]?.name ?? city.name,
        countryId: city.countryId,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}
