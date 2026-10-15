import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/jwt/jwt-auth.guard';
import { EventReviewService } from './event-review.service';
import {
  CreateEventReviewDtoReq,
  UpdateEventReviewDto,
  FindEventReviewsQueryDto,
  EventReviewResponseDto,
  PaginatedEventReviewsResponseDto,
} from './dto';

@ApiTags('Event Reviews')
@Controller('event-reviews')
export class EventReviewController {
  constructor(private readonly eventReviewService: EventReviewService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать обзор на завершённый ивент' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Обзор создан',
    type: EventReviewResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Ивент не завершён или нет контента',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Пользователь не посещал ивент',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Обзор уже существует',
  })
  async create(
    @Req() req: RequestWithUser,
    @Body() dto: CreateEventReviewDtoReq,
  ): Promise<EventReviewResponseDto> {
    return this.eventReviewService.create(req.user.userId, dto);
  }

  @Get('event/:slug')
  @ApiOperation({ summary: 'Список обзоров ивента' })
  @ApiParam({ name: 'slug', description: 'Slug ивента' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedEventReviewsResponseDto,
  })
  async findByEvent(
    @Param('slug') slug: string,
    @Query() query: FindEventReviewsQueryDto,
  ): Promise<PaginatedEventReviewsResponseDto> {
    return this.eventReviewService.findByEventSlug(slug, query);
  }

  @Get('org/:slug')
  @ApiOperation({ summary: 'Список обзоров организатора' })
  @ApiParam({ name: 'slug', description: 'Slug организатора' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedEventReviewsResponseDto,
  })
  async findByOrg(
    @Param('slug') slug: string,
    @Query() query: FindEventReviewsQueryDto,
  ): Promise<PaginatedEventReviewsResponseDto> {
    return this.eventReviewService.findByOrgSlug(slug, query);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Редактировать обзор (автор — в течение 1 часа, админ — всегда)',
  })
  @ApiParam({ name: 'id', description: 'ID обзора' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Обзор обновлён',
    type: EventReviewResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Нет прав или истёк срок редактирования',
  })
  async update(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Body() dto: UpdateEventReviewDto,
  ): Promise<EventReviewResponseDto> {
    return this.eventReviewService.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить обзор (автор или админ)' })
  @ApiParam({ name: 'id', description: 'ID обзора' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Обзор удалён',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Нет прав на удаление',
  })
  async remove(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<void> {
    return this.eventReviewService.remove(req.user.userId, id);
  }
}
