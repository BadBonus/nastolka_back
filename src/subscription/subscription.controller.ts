import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '@/auth/jwt/jwt-auth.guard';
import { MySubscriptionsResponseDto, OrganizerSubscribersResponseDto } from './dto';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('organizers/my')
  @ApiOperation({ summary: 'Список ID организаторов текущей подписки' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список ID организаторов',
    type: MySubscriptionsResponseDto,
  })
  async getMy(
    @Req() req: RequestWithUser,
  ): Promise<MySubscriptionsResponseDto> {
    return this.subscriptionService.getMyOrganizerIds(req.user.userId);
  }

  @Get('organizers/:organizerId/subscribers')
  @ApiOperation({ summary: 'Список ID подписчиков организатора' })
  @ApiParam({ name: 'organizerId', description: 'ID организатора (Org.id)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список ID подписчиков',
    type: OrganizerSubscribersResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Организатор не найден',
  })
  async getSubscribers(
    @Param('organizerId') organizerId: string,
  ): Promise<OrganizerSubscribersResponseDto> {
    return this.subscriptionService.getSubscriberIdsByOrganizerId(organizerId);
  }

  @Post('organizers/:organizerId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Подписаться на организатора' })
  @ApiParam({ name: 'organizerId', description: 'ID организатора (Org.id)' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Подписка создана' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Организатор не найден' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Нельзя подписаться на себя',
  })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Подписка уже существует' })
  async subscribe(
    @Param('organizerId') organizerId: string,
    @Req() req: RequestWithUser,
  ): Promise<void> {
    await this.subscriptionService.subscribe(req.user.userId, organizerId);
  }

  @Delete('organizers/:organizerId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Отменить подписку на организатора' })
  @ApiParam({ name: 'organizerId', description: 'ID организатора (Org.id)' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Подписка удалена' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Подписка не найдена' })
  async unsubscribe(
    @Param('organizerId') organizerId: string,
    @Req() req: RequestWithUser,
  ): Promise<void> {
    await this.subscriptionService.unsubscribe(req.user.userId, organizerId);
  }
}
