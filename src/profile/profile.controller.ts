import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './../auth/jwt/jwt-auth.guard';
import { PrismaService } from '@/prisma/prisma.service';
import {
  ApiTags,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';
import {
  ProfileUserMe,
  ProfileUserWithId,
} from './profile.controller.response';
import { HttpStatus } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private prisma: PrismaService,
  ) {}

  @Get(':id')
  @ApiOkResponse({
    description: 'Получения данных пользователя по id',
    type: ProfileUserWithId,
  })
  async findOne(
    @Param(
      'id',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_FOUND,
      }),
    )
    id: number,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nickname: true,
        email: true,
        fullName: true,
        description: true,
        slug: true,
        avatar: true,
        timezone: true,
        soclinks: true,
        gameHistory: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Profile with id ${id} not found`);
    }

    return user;
  }

  @Get('/')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Получения данных текущего авторизованного пользователя',
    type: ProfileUserMe,
  })
  async getMyProfile(@Req() req: { user: { id: number } }) {
    const { id } = req.user;
    return await this.prisma.user.findUnique({
      where: { id: id },
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
      },
    });
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  update(
    @Param(
      'id',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
      }),
    )
    id: number,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(id, updateProfileDto);
  }
}
