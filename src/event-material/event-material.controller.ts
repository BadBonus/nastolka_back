import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/jwt/jwt-auth.guard';
import { memoryStorage } from 'multer';
import { EventMaterialService } from './event-material.service';
import {
  CreateEventMaterialFileDtoReq,
  CreateEventMaterialNoteDtoReq,
  EventMaterialResponseDto,
  ReorderEventMaterialsDto,
  UpdateEventMaterialDto,
} from './dto';
import { EventMaterialFilePipe } from './pipes/event-material-file.pipe';
import { EVENT_MATERIAL_MAX_FILE_BYTES } from './event-material.constants';
import { MulterFileSizeFilter } from './filters/multer-file-size.filter';

@ApiTags('Event Materials')
@Controller('events/:eventId/materials')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EventMaterialController {
  constructor(private readonly eventMaterialService: EventMaterialService) {}

  @Post('notes')
  @ApiOperation({ summary: 'Создать текстовую заметку-материал' })
  @ApiParam({ name: 'eventId', description: 'ID ивента' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Заметка создана',
    type: EventMaterialResponseDto,
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Нет прав' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Ивент не найден' })
  async createNote(
    @Param('eventId') eventId: string,
    @Req() req: RequestWithUser,
    @Body() dto: CreateEventMaterialNoteDtoReq,
  ): Promise<EventMaterialResponseDto> {
    return this.eventMaterialService.createNote(
      eventId,
      req.user.userId,
      dto,
    );
  }

  @Post('files')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Загрузить файл-материал',
    description:
      'Multipart: поле file + title + isPublic?. Максимальный размер файла — 2 MB.',
  })
  @ApiParam({ name: 'eventId', description: 'ID ивента' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Файл загружен',
    type: EventMaterialResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.PAYLOAD_TOO_LARGE,
    description: 'Файл больше 2 MB',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Недопустимый тип файла',
  })
  @UseFilters(MulterFileSizeFilter)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: EVENT_MATERIAL_MAX_FILE_BYTES },
    }),
  )
  async createFile(
    @Param('eventId') eventId: string,
    @Req() req: RequestWithUser,
    @Body() dto: CreateEventMaterialFileDtoReq,
    @UploadedFile(new EventMaterialFilePipe()) file: Express.Multer.File,
  ): Promise<EventMaterialResponseDto> {
    return this.eventMaterialService.createFile(
      eventId,
      req.user.userId,
      dto,
      file,
    );
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Изменить порядок материалов события' })
  @ApiParam({ name: 'eventId', description: 'ID ивента' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Порядок обновлён',
    type: [EventMaterialResponseDto],
  })
  async reorder(
    @Param('eventId') eventId: string,
    @Req() req: RequestWithUser,
    @Body() dto: ReorderEventMaterialsDto,
  ): Promise<EventMaterialResponseDto[]> {
    return this.eventMaterialService.reorder(eventId, req.user.userId, dto);
  }

  @Patch(':materialId')
  @ApiOperation({ summary: 'Обновить материал события' })
  @ApiParam({ name: 'eventId', description: 'ID ивента' })
  @ApiParam({ name: 'materialId', description: 'ID материала' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Материал обновлён',
    type: EventMaterialResponseDto,
  })
  async update(
    @Param('eventId') eventId: string,
    @Param('materialId') materialId: string,
    @Req() req: RequestWithUser,
    @Body() dto: UpdateEventMaterialDto,
  ): Promise<EventMaterialResponseDto> {
    return this.eventMaterialService.update(
      eventId,
      materialId,
      req.user.userId,
      dto,
    );
  }

  @Delete(':materialId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить материал события' })
  @ApiParam({ name: 'eventId', description: 'ID ивента' })
  @ApiParam({ name: 'materialId', description: 'ID материала' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Материал удалён',
  })
  async remove(
    @Param('eventId') eventId: string,
    @Param('materialId') materialId: string,
    @Req() req: RequestWithUser,
  ): Promise<void> {
    return this.eventMaterialService.remove(
      eventId,
      materialId,
      req.user.userId,
    );
  }
}
