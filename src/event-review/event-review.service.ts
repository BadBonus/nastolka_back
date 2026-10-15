import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from '@/prisma/prisma.service';
import { EventStatus, KindOfRate } from '@pGen/enums';
import { permission } from '@/common/enums/permissions.enum';
import { SortOrder } from '@/common/dto/base.query.dto';
import {
  CreateEventReviewDtoReq,
  UpdateEventReviewDto,
  FindEventReviewsQueryDto,
  EventReviewResponseDto,
  PaginatedEventReviewsResponseDto,
} from './dto';
import { REVIEW_EDIT_WINDOW_MS } from './event-review.constants';

const reviewAuthorSelect = {
  id: true,
  slug: true,
  nickname: true,
  avatar: true,
} as const;

type ReviewWithUser = {
  id: string;
  comment: string | null;
  rates: KindOfRate[];
  createdAt: Date;
  user: {
    id: string;
    slug: string;
    nickname: string;
    avatar: string | null;
  };
};

@Injectable()
export class EventReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    dto: CreateEventReviewDtoReq,
  ): Promise<EventReviewResponseDto> {
    this.assertHasContent(dto.comment, dto.rates);

    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
      select: { id: true, orgId: true, status: true },
    });

    if (!event) {
      throw new NotFoundException('Ивент не найден');
    }

    if (event.status !== EventStatus.FINISHED) {
      throw new BadRequestException(
        'Обзор можно оставить только для завершённого ивента',
      );
    }

    const attendance = await this.prisma.eventRequest.findUnique({
      where: {
        eventId_userId: { eventId: event.id, userId },
      },
      select: { isAttended: true },
    });

    if (!attendance?.isAttended) {
      throw new ForbiddenException(
        'Обзор может оставить только участник, посетивший ивент',
      );
    }

    const existing = await this.prisma.eventReview.findUnique({
      where: {
        eventId_userId: { eventId: event.id, userId },
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Вы уже оставили обзор на этот ивент');
    }

    const review = await this.prisma.eventReview.create({
      data: {
        eventId: event.id,
        userId,
        orgId: event.orgId,
        comment: dto.comment?.trim() || null,
        rates: dto.rates ?? [],
      },
      include: { user: { select: reviewAuthorSelect } },
    });

    return this.toResponse(review);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateEventReviewDto,
  ): Promise<EventReviewResponseDto> {
    const review = await this.findReviewOrThrow(id);

    const isAuthor = review.userId === userId;
    const withinEditWindow =
      Date.now() - review.createdAt.getTime() <= REVIEW_EDIT_WINDOW_MS;

    if (!(isAuthor && withinEditWindow)) {
      const isModerator = await this.userHasPermission(
        userId,
        permission.REVIEW_EDIT_ANY,
      );
      if (!isModerator) {
        if (isAuthor) {
          throw new ForbiddenException(
            'Срок редактирования обзора истёк (доступно 1 час после создания)',
          );
        }
        throw new ForbiddenException(
          'Недостаточно прав для выполнения операции',
        );
      }
    }

    const nextComment =
      dto.comment !== undefined
        ? dto.comment === null
          ? null
          : dto.comment.trim() || null
        : review.comment;
    const nextRates = dto.rates !== undefined ? dto.rates : review.rates;

    this.assertHasContent(nextComment, nextRates);

    const updated = await this.prisma.eventReview.update({
      where: { id },
      data: {
        ...(dto.comment !== undefined && { comment: nextComment }),
        ...(dto.rates !== undefined && { rates: nextRates }),
      },
      include: { user: { select: reviewAuthorSelect } },
    });

    return this.toResponse(updated);
  }

  async remove(userId: string, id: string): Promise<void> {
    const review = await this.findReviewOrThrow(id);

    const isAuthor = review.userId === userId;
    if (!isAuthor) {
      const canDelete = await this.userHasPermission(
        userId,
        permission.REVIEW_DELETE_ANY,
      );
      if (!canDelete) {
        throw new ForbiddenException(
          'Недостаточно прав для выполнения операции',
        );
      }
    }

    await this.prisma.eventReview.delete({ where: { id } });
  }

  async findByEventSlug(
    slug: string,
    query: FindEventReviewsQueryDto,
  ): Promise<PaginatedEventReviewsResponseDto> {
    const event = await this.prisma.event.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!event) {
      throw new NotFoundException('Ивент не найден');
    }

    return this.findPaginated({ eventId: event.id }, query);
  }

  async findByOrgSlug(
    slug: string,
    query: FindEventReviewsQueryDto,
  ): Promise<PaginatedEventReviewsResponseDto> {
    const org = await this.prisma.org.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!org) {
      throw new NotFoundException('Организатор не найден');
    }

    return this.findPaginated({ orgId: org.id }, query);
  }

  private async findPaginated(
    where: { eventId?: string; orgId?: string },
    query: FindEventReviewsQueryDto,
  ): Promise<PaginatedEventReviewsResponseDto> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;
    const sortOrder = query.sortOrder ?? SortOrder.DESC;

    const [total, rows] = await Promise.all([
      this.prisma.eventReview.count({ where }),
      this.prisma.eventReview.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder },
        include: { user: { select: reviewAuthorSelect } },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 0;

    return {
      data: rows.map((row) => this.toResponse(row)),
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

  private async findReviewOrThrow(id: string) {
    const review = await this.prisma.eventReview.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Обзор не найден');
    }

    return review;
  }

  private assertHasContent(
    comment?: string | null,
    rates?: string[] | null,
  ): void {
    const hasComment = Boolean(comment?.trim());
    const hasRates = Boolean(rates && rates.length > 0);

    if (!hasComment && !hasRates) {
      throw new BadRequestException(
        'Укажите комментарий и/или хотя бы одну оценку',
      );
    }
  }

  private async userHasPermission(
    userId: string,
    required: string,
  ): Promise<boolean> {
    const userData = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        roles: {
          select: {
            permissions: {
              select: {
                permission: { select: { slug: true } },
              },
            },
          },
        },
      },
    });

    if (!userData) {
      throw new ForbiddenException('Пользователь не найден');
    }

    const permissions = new Set(
      userData.roles.flatMap((role) =>
        role.permissions.map((rp) => rp.permission.slug),
      ),
    );

    return permissions.has(required);
  }

  private toResponse(review: ReviewWithUser): EventReviewResponseDto {
    return plainToInstance(EventReviewResponseDto, {
      id: review.id,
      comment: review.comment,
      rates: review.rates,
      createdAt: review.createdAt,
      author: review.user,
    });
  }
}
