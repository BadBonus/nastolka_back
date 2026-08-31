// org.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateOrgDtoReq } from './dto/create-org.dto';
import { UpdateOrgDto } from './dto/update-org.dto';
import { Prisma } from '@pGen/client';
import { KindOfRate } from '@pGen/enums';
import { UploadsService } from '@/common/modules/uploads/uploads.service';
import { ImgproxyService } from '@/common/modules/imgproxy/imgproxy.service';
import { PATH_UPLOADED_AVATARS } from './org.contants';
import { createUniqueSlug } from '@/common/utils/createUniqueSlug';
import { ERole } from '@/common/enums/roles.enum';
import { AVERAGE_PAGES_LIMIT } from '@/common/constants/index';

@Injectable()
export class OrgService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService,
    private readonly imgproxyService: ImgproxyService,
  ) {}

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

    if (file && file.buffer) {
      const buffer = await this.uploadsService.optimizeImage(file.buffer);
      const avatar = await this.uploadsService.saveToDisk(
        buffer,
        'png',
        PATH_UPLOADED_AVATARS,
      );
      data.avatar = avatar.fileName;
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

  async findAll(page = 1, limit = AVERAGE_PAGES_LIMIT) {
    const skip = (page - 1) * limit;

    const where: Prisma.OrgWhereInput = {
      isBanned: false,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.org.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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

    return { data, meta };
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
      [KindOfRate.WIKIPEDIA_RULES]: 0,
      [KindOfRate.THEATRICALISE]: 0,
    };

    org.reviews.forEach((review) => {
      review.rates.forEach((rate) => {
        if (rate in ratingSummary) {
          ratingSummary[rate] += 1;
        }
      });
    });

    const { ...orgData } = org;

    return {
      ...orgData,
      ratings: ratingSummary,
    };
  }

  async updateMe(
    userId: string,
    dto: UpdateOrgDto,
    file?: Express.Multer.File,
  ) {
    const org = await this.prisma.org.findUnique({
      where: { userId },
    });

    if (!org) {
      throw new NotFoundException('Профиль организатора не найден');
    }

    if (file && file.buffer) {
      const buffer = await this.uploadsService.optimizeImage(file.buffer);
      const avatar = await this.uploadsService.saveToDisk(
        buffer,
        'png',
        PATH_UPLOADED_AVATARS,
      );
      dto.avatar = avatar.fileName;
    }

    return this.prisma.org.update({
      where: { id: org.id },
      data: dto,
    });
  }

  async deleteMe(userId: string) {
    const org = await this.prisma.org.findUnique({
      where: { userId },
    });

    if (!org) {
      throw new NotFoundException('Профиль организатора не найден');
    }

    return true;
  }

  // async updateByAdmin(id: string, dto: UpdateOrgDto) {
  //   const org = await this.prisma.org.findUnique({
  //     where: { id },
  //   });

  //   if (!org) {
  //     throw new NotFoundException('Организатор не найден');
  //   }

  //   return this.prisma.org.update({
  //     where: { id },
  //     data: dto,
  //   });
  // }

  // async deleteByAdmin(id: string) {
  //   const org = await this.prisma.org.findUnique({
  //     where: { id },
  //   });

  //   if (!org) {
  //     throw new NotFoundException('Организатор не найден');
  //   }

  //   return this.prisma.org.delete({
  //     where: { id },
  //   });
  // }

  async ban(id: string) {
    const org = await this.prisma.org.findUnique({
      where: { id },
    });

    if (!org) {
      throw new NotFoundException('Организатор не найден');
    }

    return this.prisma.org.update({
      where: { id },
      data: { isBanned: true },
    });
  }

  async unban(id: string) {
    const org = await this.prisma.org.findUnique({
      where: { id },
    });

    if (!org) {
      throw new NotFoundException('Организатор не найден');
    }

    return this.prisma.org.update({
      where: { id },
      data: { isBanned: false },
    });
  }
}
