import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  DefaultValuePipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { OrgService } from './org.service';
import { CreateOrgDtoReq } from './dto/create-org.dto';
import { UpdateOrgDto } from './dto/update-org.dto';
import { JwtAuthGuard } from '@/auth/jwt/jwt-auth.guard';
// import { PermissionsGuard } from '@/common/guards/permissions.guard';
// import { RequirePermissions } from '@/common/decorators/require-permissions.decorator';
// import { permission } from '@/common/enums/permissions.enum';
import { AVERAGE_PAGES_LIMIT } from '@/common/constants/index';
import {
  ApiTags,
  // ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiBearerAuth,
  // ApiQuery,
  // ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { OrgMeResponseDto } from './dto/org-me.response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageValidationPipe, ImageDimensionsPipe } from '@/common/pipes';
import { PROFILE_AVATAR_SIZE } from '@/profile/profile.constants';

@ApiTags('Org')
@Controller('org')
export class OrgController {
  constructor(private readonly orgService: OrgService) {}

  @Post('create')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiBody({ type: CreateOrgDtoReq })
  @UseGuards(JwtAuthGuard)
  create(
    @Req() req: RequestWithUser,
    @Body() dto: CreateOrgDtoReq,
    @UploadedFile(
      new ImageValidationPipe(true),
      new ImageDimensionsPipe([PROFILE_AVATAR_SIZE], true),
    )
    file?: Express.Multer.File,
  ) {
    return this.orgService.create(req.user.userId, dto, file);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(AVERAGE_PAGES_LIMIT), ParseIntPipe)
    limit: number,
  ) {
    return this.orgService.findAll(page, limit);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Получение профиля текущего авторизованного организатора',
  })
  @ApiOkResponse({
    description: 'Данные профиля организатора текущего пользователя',
    type: OrgMeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Профиль организатора не найден',
  })
  async getMe(@Req() req: RequestWithUser) {
    return this.orgService.findMe(req.user.userId);
  }

  @Patch('me')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  @UseGuards(JwtAuthGuard)
  updateMe(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateOrgDto,
    @UploadedFile(
      new ImageValidationPipe(true),
      new ImageDimensionsPipe([PROFILE_AVATAR_SIZE], true),
    )
    file?: Express.Multer.File,
  ) {
    return this.orgService.updateMe(req.user.userId, dto, file);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  deleteMe(@Req() req: RequestWithUser) {
    return this.orgService.deleteMe(req.user.userId);
  }

  // @Patch('ban/:id')
  // @UseGuards(JwtAuthGuard, PermissionsGuard)
  // @RequirePermissions(permission.ORG_MODERATE)
  // ban(@Param('id') id: string) {
  //   return this.orgService.ban(id);
  // }

  // @Patch('unban/:id')
  // @UseGuards(JwtAuthGuard, PermissionsGuard)
  // @RequirePermissions(permission.ORG_MODERATE)
  // unban(@Param('id') id: string) {
  //   return this.orgService.unban(id);
  // }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.orgService.findOne(slug);
  }

  // @Patch(':id')
  // @UseGuards(JwtAuthGuard, PermissionsGuard)
  // @RequirePermissions(Permissions.ORG_EDIT_ANY)
  // updateByAdmin(@Param('id') id: string, @Body() dto: UpdateOrgDto) {
  //   return this.orgService.updateByAdmin(id, dto);
  // }

  // @Delete(':id')
  // @UseGuards(JwtAuthGuard, PermissionsGuard)
  // @RequirePermissions(Permissions.ORG_DELETE_ANY)
  // deleteByAdmin(@Param('id') id: string) {
  //   return this.orgService.deleteByAdmin(id);
  // }
}
