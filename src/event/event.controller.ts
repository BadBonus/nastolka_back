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
  HttpCode,
  HttpStatus,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { EventService } from './event.service';
import {
  CreateEventDtoReq,
  UpdateEventDto,
  FilterEventsDto,
  CancelEventDto,
  EventResponseDto,
  PaginatedEventsResponseDto,
} from './dto/index';
import { JwtAuthGuard } from '@/auth/jwt/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { PrismaService } from '@/prisma/prisma.service';
import { RequirePermissions } from '@/common/decorators/require-permissions.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageValidationPipe, ImageDimensionsPipe } from '@/common/pipes';
import { permission } from '@/common/enums/permissions.enum';
import { EVENT_PREVIEW_IMAGE_SIZE } from './event.constants';
import { PaginationMetaDto } from '@/common/dto';

@ApiTags('Events')
@Controller('events')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(permission.EVENT_CREATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создание нового ивента' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Ивент успешно создан',
    type: EventResponseDto,
  })
  @UseInterceptors(FileInterceptor('previewImage'))
  async create(
    @Body() dto: CreateEventDtoReq,
    @UploadedFile(
      new ImageValidationPipe(true),
      new ImageDimensionsPipe([EVENT_PREVIEW_IMAGE_SIZE], true),
    )
    file?: Express.Multer.File,
  ) {
    return this.eventService.create(dto, file);
  }

  @Get()
  @ApiOperation({
    summary: 'Получение списка ивентов с фильтрацией и пагинацией',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список ивентов с метаданными пагинации',
    type: PaginatedEventsResponseDto,
  })
  async findAll(
    @Query() filters: FilterEventsDto,
  ): Promise<PaginatedEventsResponseDto> {
    return this.eventService.findAll(filters);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Получение детальной информации об ивенте по slug' })
  @ApiParam({ name: 'slug', description: 'Уникальный URL-идентификатор' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Данные ивента',
    type: EventResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Ивент не найден' })
  async findOneBySlug(@Param('slug') slug: string) {
    return this.eventService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Редактирование параметров ивента' })
  @ApiParam({ name: 'id', description: 'ID ивента' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ивент обновлен',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Нет прав на редактирование',
  })
  async update(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventService.update(id, req.user.userId, dto);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отмена ивента организатором' })
  @ApiParam({ name: 'id', description: 'ID ивента' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Статус ивента изменен на CANCELED',
    type: EventResponseDto,
  })
  async cancel(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Body() dto: CancelEventDto,
  ) {
    return this.eventService.cancel(id, req.user.userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удаление ивента' })
  @ApiParam({ name: 'id', description: 'ID ивента' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Ивент удален' })
  async remove(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<void> {
    return this.eventService.remove(id, req.user.userId);
  }
}
