import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UploadsService } from '@/common/modules/uploads/uploads.service';
import { ImgproxyService } from '@/common/modules/imgproxy/imgproxy.service';
import {
  Prisma,
  EventStatus,
  RequestStatus,
  EventFormat,
  KindOfRate,
} from '@pGen/client';
import { ERole } from '@/common/enums/roles.enum';
import { PrismaService } from '../prisma/prisma.service';
import {
  FilterEventsDto,
  CreateEventDtoReq,
  CancelEventDto,
  UpdateEventDto,
  PaginatedEventsResponseDto,
  EventResponseDto,
  EventDetailResponseDto,
} from './dto/index';
import { buildImagePath } from '@/utils/pathToImg';
import { PATH_UPLOADED_EVENTS_PREVIEW } from './event.constants';
import { createUniqueSlug } from '@/common/utils/createUniqueSlug';
import { PaginationMetaDto } from '@common/dto';
import { plainToInstance } from 'class-transformer';
import {
  EVENT_DOMAIN_EVENTS,
  EventNotificationPayload,
} from './event.events';
import { EventMaterialService } from '@/event-material/event-material.service';
import { mapEventMaterialToResponse } from '@/event-material/event-material.mapper';
import {
  assertVenueMatchesFormat,
  maskVenueForViewer,
  normalizeVenueInput,
  parseEventVenue,
  venueToPrismaJson,
} from './event-venue.util';

const SIMILAR_CANDIDATE_LIMIT = 80;
const SIMILAR_RESULT_LIMIT = 3;

@Injectable()
export class EventService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService,
    private readonly imgproxyService: ImgproxyService,
    private readonly eventEmitter: EventEmitter2,
    private readonly eventMaterialService: EventMaterialService,
  ) {}

  async create(dto: CreateEventDtoReq, file?: Express.Multer.File) {
    let preview = null;

    if (file && file.buffer) {
      const buffer = await this.uploadsService.optimizeImage(file.buffer);
      const img = await this.uploadsService.saveToDisk(
        buffer,
        'png',
        PATH_UPLOADED_EVENTS_PREVIEW,
      );
      preview = this.imgproxyService.generateSignedUrl(
        buildImagePath('events_preview') + img.fileName,
        'event_preview',
      );
    }

    assertVenueMatchesFormat(dto.format, dto.venue);
    const venue = normalizeVenueInput(dto.venue);
    const { previewImage: _previewImage, venue: _venue, ...eventData } = dto;

    const event = await this.prisma.event.create({
      data: {
        ...eventData,
        venue: venueToPrismaJson(venue),
        slug: await createUniqueSlug(dto.name),
        preview,
      },
    });

    return event;
  }

  async findAll(
    filters: FilterEventsDto,
    userId?: string,
  ): Promise<PaginatedEventsResponseDto> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.EventWhereInput = {};
    where.status = EventStatus.ACTIVE;

    if (filters.q) {
      where.name = {
        contains: filters.q,
        mode: 'insensitive',
      };
    }

    if (filters.gameSystem) where.gameSystem = filters.gameSystem;
    if (filters.format) where.format = filters.format;
    if (filters.sessionType) where.sessionType = filters.sessionType;
    if (filters.status) where.status = filters.status;
    if (filters.isBeginnerFriendly !== undefined) {
      where.isBeginnerFriendly = filters.isBeginnerFriendly;
    }

    if (filters.subscribedOnly) {
      if (!userId) {
        throw new UnauthorizedException(
          'Для фильтра subscribedOnly необходима авторизация',
        );
      }

      const subscriptions = await this.prisma.userSubscription.findMany({
        where: { subscriberId: userId },
        select: { organizerId: true },
      });

      const organizerIds = subscriptions.map((s) => s.organizerId);

      if (organizerIds.length === 0) {
        const meta = {
          total: 0,
          page,
          limit,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        } satisfies PaginationMetaDto;

        return { data: [], meta };
      }

      where.orgId = { in: organizerIds };
    }

    if (filters.favoriteOnly) {
      if (!userId) {
        throw new UnauthorizedException(
          'Для фильтра favoriteOnly необходима авторизация',
        );
      }

      const favorites = await this.prisma.eventFavorite.findMany({
        where: { userId },
        select: { eventId: true },
      });

      const eventIds = favorites.map((f) => f.eventId);

      if (eventIds.length === 0) {
        const meta = {
          total: 0,
          page,
          limit,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        } satisfies PaginationMetaDto;

        return { data: [], meta };
      }

      where.id = { in: eventIds };
    }

    if (filters.dateFrom && filters.dateTo) {
      const from = new Date(filters.dateFrom);
      const to = new Date(filters.dateTo);
      if (from > to) {
        throw new BadRequestException(
          'dateFrom не может быть позже dateTo',
        );
      }
    }

    const startsAtFilter: Prisma.DateTimeFilter = {};
    const upcomingOnly = filters.upcomingOnly !== false;
    const now = new Date();

    if (upcomingOnly) {
      startsAtFilter.gte = now;
    }

    if (filters.dateFrom) {
      const dateFrom = new Date(filters.dateFrom);
      startsAtFilter.gte =
        startsAtFilter.gte && startsAtFilter.gte > dateFrom
          ? startsAtFilter.gte
          : dateFrom;
    }

    if (filters.dateTo) {
      startsAtFilter.lte = new Date(filters.dateTo);
    }

    if (Object.keys(startsAtFilter).length > 0) {
      where.startsAt = startsAtFilter;
    }

    const sortBy = filters.sortBy ?? 'startsAt';
    const sortOrder = filters.sortOrder ?? 'asc';

    const [total, data] = await Promise.all([
      this.prisma.event.count({ where }),
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          name: true,
          slug: true,
          preview: true,
          gameSystem: true,
          format: true,
          sessionType: true,
          isBeginnerFriendly: true,
          addInfo: true,
          costValue: true,
          startsAt: true,
          maxUsers: true,
          ageLimit: true,
          endsAt: true,
          genres: true,
          minUsers: true,
          org: {
            select: {
              nickname: true,
              slug: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              requests: { where: { status: 'CONFIRMED' } },
            },
          },
        },
      }),
    ]);

    const favoriteIds = new Set<string>();

    if (userId && data.length > 0) {
      const favorites = await this.prisma.eventFavorite.findMany({
        where: {
          userId,
          eventId: { in: data.map((event) => event.id) },
        },
        select: { eventId: true },
      });

      for (const row of favorites) {
        favoriteIds.add(row.eventId);
      }
    }

    const totalPages = Math.ceil(total / limit);
    const meta = {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    const formattedData = plainToInstance(
      EventResponseDto,
      data.map((event) => ({
        ...event,
        isFavorite: favoriteIds.has(event.id),
      })),
    );

    return { data: formattedData, meta };
  }

  async findBySlug(
    slug: string,
    userId?: string,
  ): Promise<EventDetailResponseDto> {
    const event = await this.prisma.event.findUnique({
      where: { slug },
      omit: {
        createdAt: true,
        updatedAt: true,
        cancelReason: true,
        canceledAt: true,
        autoApprove: true,
      },
      include: {
        org: {
          select: {
            id: true,
            nickname: true,
            slug: true,
            avatar: true,
            userId: true,
            description: true,
            soclinks: true,
            preferredSystems: true,
            preferredGenres: true,
            country: {
              select: {
                geonameId: true,
                isoCode: true,
                name: true,
              },
            },
            reviews: {
              select: { rates: true },
            },
            _count: {
              select: {
                events: { where: { status: EventStatus.FINISHED } },
              },
            },
          },
        },
        _count: {
          select: {
            requests: { where: { status: RequestStatus.CONFIRMED } },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Ивент не найден');
    }

    const [isFavorite, canSeePrivate, isSubscribed, similar, materialRows] =
      await Promise.all([
        this.isEventFavorite(userId, event.id),
        this.canSeePrivateContent(event.id, event.org.userId, userId),
        this.isSubscribedToOrg(userId, event.org.id),
        this.findSimilarEvents(event, userId),
        event.showMaterials
          ? this.prisma.eventMaterial.findMany({
              where: { eventId: event.id },
              orderBy: { sortOrder: 'asc' },
            })
          : Promise.resolve([]),
      ]);

    const materials = event.showMaterials
      ? materialRows
          .filter((m) => canSeePrivate || m.isPublic)
          .map(mapEventMaterialToResponse)
      : [];

    const venue =
      !event.showLocation && !canSeePrivate
        ? null
        : maskVenueForViewer(parseEventVenue(event.venue), canSeePrivate);

    const { org, venue: _venue, _count, ...eventData } = event;

    return plainToInstance(EventDetailResponseDto, {
      ...eventData,
      venue,
      currentCountOfPlayers: _count.requests,
      org: {
        id: org.id,
        nickname: org.nickname,
        slug: org.slug,
        avatar: this.signOrgAvatar(org.avatar),
        description: org.description,
        soclinks: org.soclinks,
        country: org.country,
        preferredSystems: org.preferredSystems,
        preferredGenres: org.preferredGenres,
        gamesCount: org._count.events,
        ratings: this.aggregateOrgRatings(org.reviews),
        isSubscribed,
      },
      isFavorite,
      materials,
      similar,
    });
  }

  async update(id: string, userId: string, dto: UpdateEventDto) {
    const existing = await this.assertCanManageEvent(id, userId);

    const {
      previewImage: _previewImage,
      venue: venueDto,
      ...rest
    } = dto;

    const data: Prisma.EventUpdateInput = { ...rest };

    if (venueDto) {
      const format = dto.format ?? existing.format;
      assertVenueMatchesFormat(format, venueDto);
      data.venue = venueToPrismaJson(normalizeVenueInput(venueDto));
    } else if (dto.format && dto.format !== existing.format) {
      throw new BadRequestException(
        'При смене format нужно передать venue с тем же type',
      );
    }

    const event = await this.prisma.event.update({
      where: { id },
      data,
    });

    if (existing.status === EventStatus.ACTIVE) {
      this.eventEmitter.emit(
        EVENT_DOMAIN_EVENTS.UPDATED,
        this.toNotificationPayload(event),
      );
    }

    return event;
  }

  async publish(id: string, userId: string) {
    const existing = await this.assertCanManageEvent(id, userId);

    if (existing.status !== EventStatus.PREPARE) {
      throw new BadRequestException(
        'Публиковать можно только ивенты в статусе PREPARE',
      );
    }

    const event = await this.prisma.event.update({
      where: { id },
      data: { status: EventStatus.ACTIVE },
    });

    this.eventEmitter.emit(
      EVENT_DOMAIN_EVENTS.CREATED,
      this.toNotificationPayload(event),
    );

    return event;
  }

  async cancel(id: string, userId: string, dto: CancelEventDto) {
    await this.assertCanManageEvent(id, userId);

    const event = await this.prisma.event.update({
      where: { id },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
        cancelReason: dto.cancelReason,
      },
    });

    this.eventEmitter.emit(
      EVENT_DOMAIN_EVENTS.CANCELLED,
      this.toNotificationPayload(event),
    );

    return event;
  }

  async remove(id: string, userId: string) {
    const event = await this.assertCanManageEvent(id, userId);

    if (event.status !== 'PREPARE') {
      throw new BadRequestException(
        'Only events in PREPARE status can be deleted',
      );
    }

    await this.eventMaterialService.cleanupFilesForEvent(id);

    await this.prisma.event.delete({
      where: { id },
    });
  }

  private async isEventFavorite(
    userId: string | undefined,
    eventId: string,
  ): Promise<boolean> {
    if (!userId) {
      return false;
    }

    const favorite = await this.prisma.eventFavorite.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
      select: { eventId: true },
    });

    return Boolean(favorite);
  }

  private async canSeePrivateContent(
    eventId: string,
    orgOwnerId: string,
    userId?: string,
  ): Promise<boolean> {
    if (!userId) {
      return false;
    }

    if (userId === orgOwnerId) {
      return true;
    }

    const request = await this.prisma.eventRequest.findUnique({
      where: {
        eventId_userId: { eventId, userId },
      },
      select: { status: true },
    });

    return request?.status === RequestStatus.CONFIRMED;
  }

  private aggregateOrgRatings(
    reviews: Array<{ rates: KindOfRate[] }>,
  ): Record<KindOfRate, number> {
    const ratingSummary: Record<KindOfRate, number> = {
      [KindOfRate.CREATIVITY]: 0,
      [KindOfRate.STORYTELLING]: 0,
      [KindOfRate.PLAYER_EDUCATION]: 0,
      [KindOfRate.THEATRICALISE]: 0,
    };

    for (const review of reviews) {
      for (const rate of review.rates) {
        if (rate in ratingSummary) {
          ratingSummary[rate] += 1;
        }
      }
    }

    return ratingSummary;
  }

  private async isSubscribedToOrg(
    userId: string | undefined,
    organizerId: string,
  ): Promise<boolean> {
    if (!userId) {
      return false;
    }

    const subscription = await this.prisma.userSubscription.findUnique({
      where: {
        subscriberId_organizerId: { subscriberId: userId, organizerId },
      },
      select: { subscriberId: true },
    });

    return Boolean(subscription);
  }

  private signOrgAvatar(avatar: string | null): string | null {
    if (!avatar) {
      return null;
    }

    return this.imgproxyService.generateSignedUrl(
      buildImagePath('org_avatars') + avatar,
      'profile_avatar',
    );
  }

  private async findSimilarEvents(
    current: {
      id: string;
      orgId: string;
      format: EventFormat;
      gameSystem: string;
      genres: string[];
    },
    userId?: string,
  ): Promise<EventResponseDto[]> {
    const now = new Date();
    const genreFilter =
      current.genres.length > 0
        ? { genres: { hasSome: current.genres as never[] } }
        : {};

    const candidates = await this.prisma.event.findMany({
      where: {
        status: EventStatus.ACTIVE,
        id: { not: current.id },
        startsAt: { gte: now },
        OR: [
          { gameSystem: current.gameSystem as never },
          { orgId: current.orgId },
          ...(current.genres.length > 0 ? [genreFilter] : []),
        ],
      },
      take: SIMILAR_CANDIDATE_LIMIT,
      orderBy: { startsAt: 'asc' },
      select: this.listEventSelect(),
    });

    const scored = candidates
      .map((event) => ({
        event,
        score: this.scoreSimilarEvent(current, event),
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.event.startsAt.getTime() - b.event.startsAt.getTime();
      });

    const picked = scored
      .slice(0, SIMILAR_RESULT_LIMIT)
      .map((row) => row.event);
    const pickedIds = new Set(picked.map((e) => e.id));

    if (picked.length < SIMILAR_RESULT_LIMIT) {
      const fallback = await this.prisma.event.findMany({
        where: {
          status: EventStatus.ACTIVE,
          id: { notIn: [current.id, ...pickedIds] },
          startsAt: { gte: now },
        },
        take: SIMILAR_RESULT_LIMIT - picked.length,
        orderBy: { startsAt: 'asc' },
        select: this.listEventSelect(),
      });
      picked.push(...fallback);
    }

    const favoriteIds = await this.loadFavoriteIds(
      userId,
      picked.map((e) => e.id),
    );

    return plainToInstance(
      EventResponseDto,
      picked.map((event) => ({
        ...event,
        isFavorite: favoriteIds.has(event.id),
      })),
    );
  }

  private scoreSimilarEvent(
    current: {
      orgId: string;
      format: EventFormat;
      gameSystem: string;
      genres: string[];
    },
    candidate: {
      orgId: string;
      format: EventFormat;
      gameSystem: string;
      genres: string[];
    },
  ): number {
    let score = 0;
    if (candidate.gameSystem === current.gameSystem) score += 3;
    if (candidate.orgId === current.orgId) score += 2;
    if (candidate.format === current.format) score += 1;

    const currentGenres = new Set(current.genres);
    for (const genre of candidate.genres) {
      if (currentGenres.has(genre)) score += 1;
    }

    return score;
  }

  private listEventSelect() {
    return {
      id: true,
      name: true,
      slug: true,
      preview: true,
      gameSystem: true,
      format: true,
      sessionType: true,
      isBeginnerFriendly: true,
      addInfo: true,
      costValue: true,
      startsAt: true,
      maxUsers: true,
      ageLimit: true,
      endsAt: true,
      genres: true,
      minUsers: true,
      orgId: true,
      org: {
        select: {
          nickname: true,
          slug: true,
          avatar: true,
        },
      },
      _count: {
        select: {
          requests: { where: { status: RequestStatus.CONFIRMED } },
        },
      },
    } satisfies Prisma.EventSelect;
  }

  private async loadFavoriteIds(
    userId: string | undefined,
    eventIds: string[],
  ): Promise<Set<string>> {
    const favoriteIds = new Set<string>();
    if (!userId || eventIds.length === 0) {
      return favoriteIds;
    }

    const favorites = await this.prisma.eventFavorite.findMany({
      where: { userId, eventId: { in: eventIds } },
      select: { eventId: true },
    });

    for (const row of favorites) {
      favoriteIds.add(row.eventId);
    }

    return favoriteIds;
  }

  private async assertCanManageEvent(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        org: { select: { userId: true } },
      },
    });

    if (!event) {
      throw new NotFoundException('Ивент не найден');
    }

    if (event.org.userId === userId) {
      return event;
    }

    if (await this.isAdminUser(userId)) {
      return event;
    }

    throw new ForbiddenException(
      'Недостаточно прав для управления этим ивентом',
    );
  }

  private async isAdminUser(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        roles: { select: { slug: true } },
      },
    });

    return Boolean(user?.roles.some((role) => role.slug === ERole.ADMIN));
  }

  private toNotificationPayload(event: {
    id: string;
    orgId: string;
    name: string;
    slug: string;
    status: string;
    startsAt: Date;
    endsAt: Date;
    cancelReason?: string | null;
  }): EventNotificationPayload {
    return {
      id: event.id,
      orgId: event.orgId,
      name: event.name,
      slug: event.slug,
      status: event.status,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      cancelReason: event.cancelReason ?? null,
    };
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    let slug = baseSlug;
    let counter = 1;
    let isUnique = false;

    while (!isUnique) {
      const existingEvent = await this.prisma.event.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (!existingEvent) {
        isUnique = true;
      } else {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    return slug;
  }
}
