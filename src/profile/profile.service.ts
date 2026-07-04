import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private readonly uploadsService: UploadsService,
  ) {}
  create(createProfileDto: CreateProfileDto) {
    return 'This action adds a new profile';
  }

  findOne(id: number) {
    return `This action returns a #${id} profile`;
  }

  async updateProfile(
    userId: number,
    dto: UpdateProfileDto,
    file?: Express.Multer.File,
  ) {
    const { ...updateData } = dto;
    const dataToUpdate: Record<string, any> = { ...updateData };
    if (file && file.buffer) {
      const buffer = await this.uploadsService.optimizeImage(file.buffer);
      const avatar = await this.uploadsService.saveToDisk(
        buffer,
        'png',
        process.env.PATH_UPLOADED_AVATARS,
      );
      dataToUpdate.avatar = avatar.fileName;
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });
  }

  async getMyProfile(userId: number) {
    console.log('getMyProfile', userId);
    return await this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}
