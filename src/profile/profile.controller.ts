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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { Request } from 'express';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { JwtAuthGuard } from './../auth/jwt/jwt-auth.guard';
import { PrismaService } from '@/prisma/prisma.service';
import { RequirePermissions } from '@/common/decorators/require-permissions.decorator';
import { AppPermission } from '@/common/enums/permissions.enum';
import {
  ApiTags,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import {
  ProfileUserMe,
  ProfileUserWithId,
} from './profile.controller.response';
import { HttpStatus } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageDimensionsPipe, ImageValidationPipe } from '@/common/pipes';

const PROFILE_AVATAR_SIZE = [256, 256] as [number, number];

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private prisma: PrismaService,
  ) {}

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

  @Patch('me')
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateMe(
    @Req() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile(
      new ImageValidationPipe(true),
      new ImageDimensionsPipe([PROFILE_AVATAR_SIZE], true),
    )
    file?: Express.Multer.File,
  ) {
    const userId = req.user.userId;

    return await this.profileService.updateProfile(
      userId,
      updateProfileDto,
      file,
    );
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(AppPermission.USER_EDIT)
  @UseInterceptors(FileInterceptor('avatar'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile(
      new ImageValidationPipe(true),
      new ImageDimensionsPipe([PROFILE_AVATAR_SIZE], true),
    )
    file?: Express.Multer.File,
  ) {
    return await this.profileService.updateProfile(id, updateProfileDto, file);
  }
}
