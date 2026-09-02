import {
  Controller,
  Get,
  Post,
  Delete,
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
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { JwtAuthGuard } from '@/auth/jwt/jwt-auth.guard';
import { PrismaService } from '@/prisma/prisma.service';
import { RequirePermissions } from '@/common/decorators/require-permissions.decorator';
import { permission } from '@/common/enums/permissions.enum';
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
} from './dto/profile-user.response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageDimensionsPipe, ImageValidationPipe } from '@/common/pipes';
import { PROFILE_AVATAR_SIZE } from './profile.constants';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private prisma: PrismaService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Получения данных текущего авторизованного пользователя',
    type: ProfileUserMe,
  })
  async getMyProfile(@Req() req: RequestWithUser) {
    const { userId } = req.user;
    return this.profileService.findUser(userId);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Получения данных пользователя по id',
    type: ProfileUserWithId,
  })
  async findOne(@Param('id') id: string) {
    const user = await this.profileService.findUser(id);

    if (!user) {
      throw new NotFoundException(`Profile with id ${id} not found`);
    }

    return user;
  }

  @Patch('me')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateProfileDto })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateMe(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateProfileDto,
    @UploadedFile(
      new ImageValidationPipe(true),
      new ImageDimensionsPipe([PROFILE_AVATAR_SIZE], true),
    )
    file?: Express.Multer.File,
  ) {
    const userId = req.user.userId;
    return await this.profileService.updateProfile(userId, dto, file);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(permission.USER_EDIT)
  @UseInterceptors(FileInterceptor('avatar'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProfileDto,
    @UploadedFile(
      new ImageValidationPipe(true),
      new ImageDimensionsPipe([PROFILE_AVATAR_SIZE], true),
    )
    file?: Express.Multer.File,
  ) {
    return await this.profileService.updateProfile(id, dto, file);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  deleteMe(@Req() req: RequestWithUser) {
    const userId = req.user.userId;
    console.log('userId');
    console.log(userId);

    return this.profileService.remove(userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(permission.USER_DELETE)
  remove(@Param('id') id: string) {
    return this.profileService.remove(id);
  }
}
