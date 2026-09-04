import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UploadsService } from '@/common/modules/uploads/uploads.service';
import { ImgproxyService } from '@/common/modules/imgproxy/imgproxy.service';
import { Prisma, EventStatus } from '@pGen/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  FilterEventsDto,
  CreateEventDtoReq,
  CancelEventDto,
  UpdateEventDto,
  PaginatedEventsResponseDto,
  EventResponseDto,
} from './dto/index';
import { buildImagePath } from '@/utils/pathToImg';
import { PATH_UPLOADED_EVENTS_PREVIEW } from './event.constants';
import { AVERAGE_PAGES_LIMIT } from '@/common/constants/index';
import { createUniqueSlug } from '@/common/utils/createUniqueSlug';
import { PaginationMetaDto } from '@common/dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class EventService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService,
    private readonly imgproxyService: ImgproxyService,
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

    const event = await this.prisma.event.create({
      data: {
        ...dto,
        slug: await createUniqueSlug(dto.name),
        preview,
      },
    });

    return event;
  }

  async findAll(filters: FilterEventsDto): Promise<PaginatedEventsResponseDto> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.EventWhereInput = {};
    where.status = EventStatus.PREPARE;

    if (filters.gameSystem) where.gameSystem = filters.gameSystem;
    if (filters.format) where.format = filters.format;
    if (filters.sessionType) where.sessionType = filters.sessionType;
    if (filters.status) where.status = filters.status;
    if (filters.isBeginnerFriendly !== undefined) {
      where.isBeginnerFriendly = filters.isBeginnerFriendly;
    }

    const [total, data] = await Promise.all([
      this.prisma.event.count({ where }),
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          name: true,
          slug: true,
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

    const totalPages = Math.ceil(total / limit);
    const meta = {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    const formattedData = plainToInstance(EventResponseDto, data);

    return { data: formattedData, meta };
  }

  async findBySlug(slug: string) {
    const event = await this.prisma.event.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { requests: { where: { status: 'CONFIRMED' } } },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async update(id: string, userId: string, dto: UpdateEventDto) {
    await this.checkOwnership(id, userId);

    return this.prisma.event.update({
      where: { id },
      data: dto,
    });
  }

  async cancel(id: string, userId: string, dto: CancelEventDto) {
    await this.checkOwnership(id, userId);

    return this.prisma.event.update({
      where: { id },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
        cancelReason: dto.cancelReason,
      },
    });
  }

  async remove(id: string, userId: string) {
    const event = await this.checkOwnership(id, userId);

    if (event.status !== 'PREPARE') {
      throw new BadRequestException(
        'Only events in PREPARE status can be deleted',
      );
    }

    await this.prisma.event.delete({
      where: { id },
    });
  }

  private async checkOwnership(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.orgId !== userId) {
      throw new ForbiddenException('You are not the organizer of this event');
    }

    return event;
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
