import {
  Injectable,
  NotFoundException,
  // ConflictException,
  // UnauthorizedException,
  // BadRequestException,
  // NotFoundException,
} from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { UploadsService } from '@/common/modules/uploads/uploads.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { ImgproxyService } from '@/common/modules/imgproxy/imgproxy.service';
import { buildImagePath } from '@/utils/pathToImg';
import { PATH_UPLOADED_AVATARS } from './profile.constants';
import { Prisma } from '@pGen/client';

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private readonly uploadsService: UploadsService,
    private readonly imgproxyService: ImgproxyService,
  ) {}
  create(createProfileDto: CreateProfileDto) {
    return 'This action adds a new profile';
  }

  async findUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        email: true,
        fullName: true,
        description: true,
        birthdate: true,
        slug: true,
        avatar: true,
        timezone: true,
        soclinks: true,
        gameHistory: true,
        isVerified: true,
        schedules: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (user?.avatar) {
      user.avatar = this.imgproxyService.generateSignedUrl(
        buildImagePath('avatars') + user.avatar,
        'profile_avatar',
      );
    }

    return user;
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
    file?: Express.Multer.File,
  ) {
    const { schedules, ...updateData } = dto;
    const dataToUpdate: Prisma.UserUpdateInput = { ...updateData };

    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (file && file.buffer) {
      const buffer = await this.uploadsService.optimizeImage(file.buffer);
      const avatar = await this.uploadsService.saveToDisk(
        buffer,
        'png',
        PATH_UPLOADED_AVATARS,
      );
      dataToUpdate.avatar = avatar.fileName;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...dataToUpdate,
        ...(schedules && {
          schedules: {
            deleteMany: {},
            createMany: {
              data: schedules,
            },
          },
        }),
      },
    });
  }

  async remove(userId: string) {
    try {
      return await this.prisma.user.delete({
        where: { id: userId },
      });
    } catch (error) {
      const err = error as { code?: string };

      if (err?.code === 'P2025') {
        throw new NotFoundException('Пользователь не найден');
      }
      throw error;
    }
  }
}
