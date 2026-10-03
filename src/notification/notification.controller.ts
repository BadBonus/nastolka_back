import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/jwt/jwt-auth.guard';
import { NotificationService } from './notification.service';
import {
  FindNotificationsQueryDto,
  NotificationResponseDto,
  PaginatedNotificationsResponseDto,
  UnreadCountResponseDto,
} from './dto';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Список уведомлений текущего пользователя' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedNotificationsResponseDto,
  })
  async findAll(
    @Req() req: RequestWithUser,
    @Query() query: FindNotificationsQueryDto,
  ): Promise<PaginatedNotificationsResponseDto> {
    return this.notificationService.findAll(req.user.userId, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Количество непрочитанных уведомлений' })
  @ApiResponse({ status: HttpStatus.OK, type: UnreadCountResponseDto })
  async unreadCount(
    @Req() req: RequestWithUser,
  ): Promise<UnreadCountResponseDto> {
    return this.notificationService.getUnreadCount(req.user.userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Отметить уведомление как прочитанное' })
  @ApiParam({ name: 'id', description: 'ID уведомления' })
  @ApiResponse({ status: HttpStatus.OK, type: NotificationResponseDto })
  async markAsRead(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.markAsRead(req.user.userId, id);
  }
}
