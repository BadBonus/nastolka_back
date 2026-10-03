import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { MySubscriptionsResponseDto, OrganizerSubscribersResponseDto } from './dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(subscriberId: string, organizerId: string): Promise<void> {
    const org = await this.prisma.org.findUnique({
      where: { id: organizerId },
      select: { id: true, userId: true },
    });

    if (!org) {
      throw new NotFoundException('Организатор не найден');
    }

    if (org.userId === subscriberId) {
      throw new BadRequestException('Нельзя подписаться на собственного организатора');
    }

    const existing = await this.prisma.userSubscription.findUnique({
      where: {
        subscriberId_organizerId: { subscriberId, organizerId },
      },
    });

    if (existing) {
      throw new ConflictException('Подписка уже существует');
    }

    await this.prisma.userSubscription.create({
      data: { subscriberId, organizerId },
    });
  }

  async unsubscribe(subscriberId: string, organizerId: string): Promise<void> {
    const existing = await this.prisma.userSubscription.findUnique({
      where: {
        subscriberId_organizerId: { subscriberId, organizerId },
      },
    });

    if (!existing) {
      throw new NotFoundException('Подписка не найдена');
    }

    await this.prisma.userSubscription.delete({
      where: {
        subscriberId_organizerId: { subscriberId, organizerId },
      },
    });
  }

  async getMyOrganizerIds(
    subscriberId: string,
  ): Promise<MySubscriptionsResponseDto> {
    const rows = await this.prisma.userSubscription.findMany({
      where: { subscriberId },
      select: { organizerId: true },
    });

    return plainToInstance(MySubscriptionsResponseDto, {
      organizerIds: rows.map((r) => r.organizerId),
    });
  }

  async getSubscriberIdsByOrganizerId(
    organizerId: string,
  ): Promise<OrganizerSubscribersResponseDto> {
    const org = await this.prisma.org.findUnique({
      where: { id: organizerId },
      select: { id: true },
    });

    if (!org) {
      throw new NotFoundException('Организатор не найден');
    }

    const subscriberIds = await this.getSubscriberIds(organizerId);

    return plainToInstance(OrganizerSubscribersResponseDto, {
      subscriberIds,
    });
  }

  async getSubscriberIds(organizerId: string): Promise<string[]> {
    const rows = await this.prisma.userSubscription.findMany({
      where: { organizerId },
      select: { subscriberId: true },
    });

    return rows.map((r) => r.subscriberId);
  }
}
