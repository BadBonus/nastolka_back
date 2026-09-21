// org.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateOrgDtoReq } from './dto/create-org.dto';
import { UpdateOrgDto } from './dto/update-org.dto';
import { Prisma, OrgFormatMode } from '@pGen/client';
import { KindOfRate } from '@pGen/enums';
import { UploadsService } from '@/common/modules/uploads/uploads.service';
import { ImgproxyService } from '@/common/modules/imgproxy/imgproxy.service';
import { PATH_UPLOADED_AVATARS } from './org.contants';
import { createUniqueSlug } from '@/common/utils/createUniqueSlug';
import { ERole } from '@/common/enums/roles.enum';
import { AVERAGE_PAGES_LIMIT } from '@/common/constants/index';
import { buildImagePath } from '@/utils/pathToImg';
import { FindAllOrgsQueryDto, OrgSortBy } from './dto/find-all-orgs-query.dto';
import { SortOrder } from '@common/dto';

const orgGeoInclude = {
  country: {
    select: { geonameId: true, isoCode: true, name: true },
  },
  city: {
    select: {
      geonameId: true,
      name: true,
      alternateNames: {
        where: { lang: 'ru' },
        orderBy: [
          { isPreferredName: 'desc' as const },
          { name: 'asc' as const },
        ],
        take: 1,
        select: { name: true },
      },
    },
  },
} satisfies Prisma.OrgInclude;

type OrgWithGeo = Prisma.OrgGetPayload<{ include: typeof orgGeoInclude }>;

@Injectable()
export class OrgService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService,
    private readonly imgproxyService: ImgproxyService,
  ) {}

  // ---------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------

  async create(
    userId: string,
    dto: CreateOrgDtoReq,
    file?: Express.Multer.File,
  ) {
    const existingOrg = await this.prisma.org.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (existingOrg) {
      throw new ConflictException(
        'У пользователя уже есть профиль организатора',
      );
    }

    const formatMode = dto.formatMode ?? OrgFormatMode.HYBRID;
    const cityId = dto.cityId ?? null;

    await this.assertOrgLocation({
      formatMode,
      countryId: dto.countryId,
      cityId,
    });

    const { avatar: _avatar, formatMode: _fm, cityId: _cid, ...rest } = dto;

    const data: Prisma.OrgUncheckedCreateInput = {
      ...rest,
      formatMode,
      cityId,
      slug: createUniqueSlug(dto.nickname),
      userId,
    };

    if (file?.buffer) {
      data.avatar = await this.handleAvatarUpload(file);
    }

    return this.prisma.$transaction(async (tx) => {
      const org = await tx.org.create({
        data,
        include: orgGeoInclude,
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          roles: {
            connect: [{ slug: ERole.ORG }],
          },
        },
      });

      return this.mapOrgResponse(org);
    });
  }

  async findAll(query: FindAllOrgsQueryDto) {
    const {
      page = 1,
      limit = AVERAGE_PAGES_LIMIT,
      sortBy = OrgSortBy.CREATED_AT,
      sortOrder = SortOrder.DESC,
      minCost,
      maxCost,
      minEvents,
      preferredSystems,
      formatMode,
      countryId,
      cityId,
      q,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.OrgWhereInput = {
      isBanned: false,
    };

    if (q) {
      where.nickname = {
        contains: q,
        mode: 'insensitive',
      };
    }

    if (minCost !== undefined || maxCost !== undefined) {
      if (minCost === undefined && maxCost !== undefined) {
        where.OR = [{ costValue: { lte: maxCost } }, { costValue: null }];
      } else {
        where.costValue = {
          ...(minCost !== undefined && { gte: minCost }),
          ...(maxCost !== undefined && { lte: maxCost }),
        };
      }
    }

    if (preferredSystems && preferredSystems.length > 0) {
      where.preferredSystems = {
        hasSome: preferredSystems,
      };
    }

    if (formatMode === OrgFormatMode.ONLINE) {
      where.formatMode = { in: [OrgFormatMode.ONLINE, OrgFormatMode.HYBRID] };
    } else if (formatMode === OrgFormatMode.OFFLINE) {
      where.formatMode = { in: [OrgFormatMode.OFFLINE, OrgFormatMode.HYBRID] };
    } else if (formatMode === OrgFormatMode.HYBRID) {
      where.formatMode = OrgFormatMode.HYBRID;
    }

    if (countryId !== undefined) {
      where.countryId = countryId;
    }

    if (cityId !== undefined) {
      where.cityId = cityId;
    }

    if (minEvents !== undefined) {
      const groupedEvents = await this.prisma.event.groupBy({
        by: ['orgId'],
        having: {
          orgId: {
            _count: {
              gte: minEvents,
            },
          },
        },
      });

      const matchedOrgIds = groupedEvents
        .map((item) => item.orgId)
        .filter((id): id is string => id !== null);

      where.id = {
        in: matchedOrgIds,
      };
    }

    let orderBy: Prisma.OrgOrderByWithRelationInput;

    switch (sortBy) {
      case OrgSortBy.EVENTS_COUNT:
        orderBy = { events: { _count: sortOrder } };
        break;
      case OrgSortBy.REVIEWS_COUNT:
        orderBy = { reviews: { _count: sortOrder } };
        break;
      case OrgSortBy.CREATED_AT:
      default:
        orderBy = { createdAt: sortOrder };
        break;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.org.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: orgGeoInclude,
      }),
      this.prisma.org.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const meta = {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    return {
      data: data.map((org) => this.mapOrgResponse(org)),
      meta,
    };
  }

  async findMe(userId: string) {
    const org = await this.prisma.org.findUnique({
      where: { userId },
      include: {
        ...orgGeoInclude,
        reviews: true,
        events: true,
      },
    });

    if (!org) {
      throw new NotFoundException('Профиль организатора не найден');
    }

    return this.mapOrgResponse(org);
  }

  async findOne(slug: string) {
    const org = await this.prisma.org.findUnique({
      where: { slug },
      include: {
        ...orgGeoInclude,
        events: true,
        reviews: {
          select: {
            rates: true,
          },
        },
      },
    });

    if (!org) {
      throw new NotFoundException('Организатор не найден');
    }

    const ratingSummary: Record<KindOfRate, number> = {
      [KindOfRate.CREATIVITY]: 0,
      [KindOfRate.STORYTELLING]: 0,
      [KindOfRate.PLAYER_EDUCATION]: 0,
      [KindOfRate.THEATRICALISE]: 0,
    };

    org.reviews.forEach((review) => {
      review.rates.forEach((rate) => {
        if (rate in ratingSummary) {
          ratingSummary[rate] += 1;
        }
      });
    });

    const { reviews: _reviews, ...orgData } = org;

    return {
      ...this.mapOrgResponse(orgData),
      ratings: ratingSummary,
    };
  }

  async updateMe(
    userId: string,
    dto: UpdateOrgDto,
    file?: Express.Multer.File,
  ) {
    const org = await this.findOrgByUserIdOrThrow(userId);

    const formatMode = dto.formatMode ?? org.formatMode;
    const countryId = dto.countryId ?? org.countryId;
    const cityId =
      dto.cityId !== undefined ? dto.cityId : org.cityId;

    await this.assertOrgLocation({
      formatMode,
      countryId,
      cityId,
    });

    const {
      avatar: _avatar,
      formatMode: _fm,
      countryId: _co,
      cityId: _ci,
      ...rest
    } = dto;

    const data: Prisma.OrgUncheckedUpdateInput = {
      ...rest,
      ...(dto.formatMode !== undefined && { formatMode: dto.formatMode }),
      ...(dto.countryId !== undefined && { countryId: dto.countryId }),
      ...(dto.cityId !== undefined && { cityId: dto.cityId }),
    };

    const previousAvatar = org.avatar;

    if (file?.buffer) {
      data.avatar = await this.handleAvatarUpload(file);
    }

    const updated = await this.prisma.org.update({
      where: { id: org.id },
      data,
      include: orgGeoInclude,
    });

    if (file?.buffer && previousAvatar && previousAvatar !== updated.avatar) {
      await this.uploadsService
        .deleteFromDisk(previousAvatar, PATH_UPLOADED_AVATARS)
        .catch(() => undefined);
    }

    return this.mapOrgResponse(updated);
  }

  async deleteMe(userId: string) {
    const org = await this.findOrgByUserIdOrThrow(userId);

    await this.prisma.$transaction(async (tx) => {
      await tx.org.delete({ where: { id: org.id } });

      await tx.user.update({
        where: { id: userId },
        data: {
          roles: {
            disconnect: [{ slug: ERole.ORG }],
          },
        },
      });
    });

    if (org.avatar) {
      await this.uploadsService
        .deleteFromDisk(org.avatar, PATH_UPLOADED_AVATARS)
        .catch(() => undefined);
    }

    return true;
  }

  async ban(id: string) {
    return this.setBanned(id, true);
  }

  async unban(id: string) {
    return this.setBanned(id, false);
  }

  // ---------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------

  private async assertOrgLocation(params: {
    formatMode: OrgFormatMode;
    countryId: number;
    cityId?: number | null;
  }): Promise<void> {
    const country = await this.prisma.country.findUnique({
      where: { geonameId: params.countryId },
      select: { geonameId: true },
    });

    if (!country) {
      throw new NotFoundException('Страна не найдена');
    }

    const needsCity =
      params.formatMode === OrgFormatMode.HYBRID ||
      params.formatMode === OrgFormatMode.OFFLINE;

    if (needsCity && params.cityId == null) {
      throw new BadRequestException(
        'Для HYBRID/OFFLINE необходимо указать город',
      );
    }

    if (params.cityId != null) {
      const city = await this.prisma.city.findUnique({
        where: { geonameId: params.cityId },
        select: { geonameId: true, countryId: true },
      });

      if (!city) {
        throw new NotFoundException('Город не найден');
      }

      if (city.countryId !== params.countryId) {
        throw new BadRequestException(
          'Город не принадлежит указанной стране',
        );
      }
    }
  }

  private mapOrgResponse<T extends OrgWithGeo>(org: T) {
    const { country, city, countryId: _c, cityId: _ci, ...rest } = org;

    return this.withSignedAvatar({
      ...rest,
      country: {
        geonameId: country.geonameId,
        isoCode: country.isoCode,
        name: country.name,
      },
      city: city
        ? {
            geonameId: city.geonameId,
            name: city.alternateNames[0]?.name ?? city.name,
          }
        : null,
    });
  }

  private async setBanned(id: string, isBanned: boolean) {
    await this.findOrgByIdOrThrow(id);

    return this.prisma.org.update({
      where: { id },
      data: { isBanned },
      include: orgGeoInclude,
    });
  }

  private async findOrgByUserIdOrThrow(userId: string) {
    const org = await this.prisma.org.findUnique({ where: { userId } });

    if (!org) {
      throw new NotFoundException('Профиль организатора не найден');
    }

    return org;
  }

  private async findOrgByIdOrThrow(id: string) {
    const org = await this.prisma.org.findUnique({ where: { id } });

    if (!org) {
      throw new NotFoundException('Организатор не найден');
    }

    return org;
  }

  private async handleAvatarUpload(file: Express.Multer.File): Promise<string> {
    const buffer = await this.uploadsService.optimizeImage(file.buffer);
    const avatar = await this.uploadsService.saveToDisk(
      buffer,
      'png',
      PATH_UPLOADED_AVATARS,
    );
    return avatar.fileName;
  }

  /** Returns a shallow copy of `org` with `avatar` replaced by a signed URL. */
  private withSignedAvatar<T extends { avatar: string | null }>(org: T): T {
    if (!org.avatar) {
      return org;
    }

    return {
      ...org,
      avatar: this.imgproxyService.generateSignedUrl(
        buildImagePath('org_avatars') + org.avatar,
        'profile_avatar',
      ),
    };
  }
}
