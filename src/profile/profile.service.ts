import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { UploadsService } from '../common/modules/uploads/uploads.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { ImgproxyService } from '@/common/modules/imgproxy/imgproxy.service';
import { buildImagePath } from '@/utils/pathToImg';
import { PATH_UPLOADED_AVATARS } from './profile.constants';

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

  async findUser(userId: number) {
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

    if (user?.avatar) {
      user.avatar = this.imgproxyService.generateSignedUrl(
        buildImagePath('avatars') + user.avatar,
        'profile_avatar',
      );
    }

    return user;
  }

  async updateProfile(
    userId: number,
    dto: UpdateProfileDto,
    file?: Express.Multer.File,
  ) {
    const { schedules, ...updateData } = dto;
    const dataToUpdate: Record<string, any> = { ...updateData };
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

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}
