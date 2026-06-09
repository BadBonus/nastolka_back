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

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}
  create(createProfileDto: CreateProfileDto) {
    return 'This action adds a new profile';
  }

  findOne(id: number) {
    return `This action returns a #${id} profile`;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
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
