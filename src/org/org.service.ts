// org.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateOrgDtoReq } from './dto/create-org.dto';
import { UpdateOrgDto } from './dto/update-org.dto';
import { Prisma, Org } from '@pGen/client';
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

    const data: Prisma.OrgUncheckedCreateInput = {
      ...dto,
      slug: createUniqueSlug(dto.nickname),
      userId,
    };

    if (file?.buffer) {
      data.avatar = await this.handleAvatarUpload(file);
    }

    return this.prisma.$transaction(async (tx) => {
      const org = await tx.org.create({ data });

      await tx.user.update({
        where: { id: userId },
        data: {
          roles: {
            connect: [{ slug: ERole.ORG }],
          },
        },
      });

      return org;
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

    // NOTE: kept the original semantics (null costValue is only included
    // when *only* maxCost is supplied). This asymmetry looked intentional
    // in the review but wasn't confirmed — flag with product before
    // changing it, since it silently affects search results either way.
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

    if (minEvents !== undefined) {
      // NOTE: for large datasets this materializes every matching orgId
      // client-side before the main query. Fine at current scale; if the
      // orgs table grows significantly, move this into a single query
      // (raw SQL HAVING, or a computed column) instead.
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
      }),
      this.prisma.org.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const meta: TPaginationMeta = {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    return { data: data.map((org) => this.withSignedAvatar(org)), meta };
  }

  async findMe(userId: string) {
    const org = await this.prisma.org.findUnique({
      where: { userId },
      select: {
        id: true,
        slug: true,
        nickname: true,
        description: true,
        costValue: true,
        costCurrency: true,
        avatar: true,
        timezone: true,
        email: true,
        isBanned: true,
        preferredSystems: true,
        preferredGenres: true,
        preferredFormats: true,
        gameHistory: true,
        soclinks: true,
        reviews: true,
        events: true,
      },
    });

    if (!org) {
      throw new NotFoundException('Профиль организатора не найден');
    }

    return this.withSignedAvatar(org);
  }

  async findOne(slug: string) {
    const org = await this.prisma.org.findUnique({
      where: { slug },
      include: {
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

    // FIX: previously this spread the full org (reviews included) back
    // into the response alongside ratingSummary. `reviews` is now
    // explicitly excluded — only the aggregated ratings go out.
    const { reviews, ...orgData } = org;

    return {
      ...this.withSignedAvatar(orgData),
      ratings: ratingSummary,
    };
  }

  async updateMe(
    userId: string,
    dto: UpdateOrgDto,
    file?: Express.Multer.File,
  ) {
    const org = await this.findOrgByUserIdOrThrow(userId);

    const data: Prisma.OrgUpdateInput = { ...dto };
    const previousAvatar = org.avatar;

    if (file?.buffer) {
      data.avatar = await this.handleAvatarUpload(file);
    }

    const updated = await this.prisma.org.update({
      where: { id: org.id },
      data,
    });

    if (file?.buffer && previousAvatar && previousAvatar !== updated.avatar) {
      await this.uploadsService
        .deleteFromDisk(previousAvatar, PATH_UPLOADED_AVATARS)
        .catch(() => undefined);
    }

    return updated;
  }

  async deleteMe(userId: string) {
    const org = await this.findOrgByUserIdOrThrow(userId);

    // FIX: the original method verified the org existed but never
    // deleted anything and always returned `true`. This now actually
    // removes the record.
    //
    // NOTE: if `events`/`reviews` don't cascade on delete in your Prisma
    // schema, this will throw a foreign-key constraint error for any
    // org with existing events/reviews. Decide whether that's the
    // desired behavior (block deletion) or whether cascading / a
    // soft-delete flag (e.g. `isDeleted`) is more appropriate — I didn't
    // have the schema to confirm which.
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

  private async setBanned(id: string, isBanned: boolean) {
    await this.findOrgByIdOrThrow(id);

    return this.prisma.org.update({
      where: { id },
      data: { isBanned },
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
