import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '@/prisma/prisma.service';
import { SubscriptionService } from '@/subscription/subscription.service';
import {
  EVENT_DOMAIN_EVENTS,
  EventNotificationPayload,
} from '@/event/event.events';
import {
  TELEGRAM_NOTIFICATIONS_QUEUE,
  TelegramNotificationJobData,
} from '@/telegram/telegram.constants';

const RECIPIENT_BATCH_SIZE = 100;

@Injectable()
export class NotificationListener {
  private readonly logger = new Logger(NotificationListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionService: SubscriptionService,
    @InjectQueue(TELEGRAM_NOTIFICATIONS_QUEUE)
    private readonly telegramQueue: Queue<TelegramNotificationJobData>,
  ) {}

  @OnEvent(EVENT_DOMAIN_EVENTS.CREATED)
  async handleEventCreated(payload: EventNotificationPayload): Promise<void> {
    const subscriberIds = await this.subscriptionService.getSubscriberIds(
      payload.orgId,
    );

    if (subscriberIds.length === 0) {
      return;
    }

    await this.prisma.notification.createMany({
      data: subscriberIds.map((userId) => ({
        userId,
        type: EVENT_DOMAIN_EVENTS.CREATED,
        payload: payload as object,
      })),
    });

    await this.enqueueTelegramJobs(
      EVENT_DOMAIN_EVENTS.CREATED,
      payload,
      subscriberIds,
    );
  }

  @OnEvent(EVENT_DOMAIN_EVENTS.UPDATED)
  async handleEventUpdated(payload: EventNotificationPayload): Promise<void> {
    const subscriberIds = await this.subscriptionService.getSubscriberIds(
      payload.orgId,
    );

    if (subscriberIds.length === 0) {
      return;
    }

    await this.enqueueTelegramJobs(
      EVENT_DOMAIN_EVENTS.UPDATED,
      payload,
      subscriberIds,
    );
  }

  @OnEvent(EVENT_DOMAIN_EVENTS.CANCELLED)
  async handleEventCancelled(
    payload: EventNotificationPayload,
  ): Promise<void> {
    const subscriberIds = await this.subscriptionService.getSubscriberIds(
      payload.orgId,
    );

    if (subscriberIds.length === 0) {
      return;
    }

    await this.enqueueTelegramJobs(
      EVENT_DOMAIN_EVENTS.CANCELLED,
      payload,
      subscriberIds,
    );
  }

  private async enqueueTelegramJobs(
    type: TelegramNotificationJobData['type'],
    payload: EventNotificationPayload,
    recipientIds: string[],
  ): Promise<void> {
    const event = {
      id: payload.id,
      orgId: payload.orgId,
      name: payload.name,
      slug: payload.slug,
      status: payload.status,
      startsAt: new Date(payload.startsAt).toISOString(),
      endsAt: new Date(payload.endsAt).toISOString(),
      cancelReason: payload.cancelReason ?? null,
    };

    for (let i = 0; i < recipientIds.length; i += RECIPIENT_BATCH_SIZE) {
      const batch = recipientIds.slice(i, i + RECIPIENT_BATCH_SIZE);
      await this.telegramQueue.add(
        type,
        { type, event, recipientIds: batch },
        {
          removeOnComplete: true,
          removeOnFail: 1000,
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        },
      );
    }

    this.logger.debug(
      `Enqueued telegram jobs type=${type} recipients=${recipientIds.length}`,
    );
  }
}
