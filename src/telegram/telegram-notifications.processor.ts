import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '@/prisma/prisma.service';
import { TelegramBotService } from './telegram-bot.service';
import {
  TELEGRAM_NOTIFICATIONS_QUEUE,
  TelegramNotificationJobData,
} from './telegram.constants';

@Processor(TELEGRAM_NOTIFICATIONS_QUEUE, {
  limiter: {
    max: 30,
    duration: 1000,
  },
})
export class TelegramNotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(TelegramNotificationsProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramBotService: TelegramBotService,
  ) {
    super();
  }

  async process(job: Job<TelegramNotificationJobData>): Promise<void> {
    if (!this.telegramBotService.isReady()) {
      this.logger.warn('Skip telegram job: bot is not ready');
      return;
    }

    const { type, event, recipientIds } = job.data;
    const text = this.telegramBotService.buildMessageText(type, event);

    const accounts = await this.prisma.telegramAccount.findMany({
      where: {
        userId: { in: recipientIds },
        isActive: true,
      },
    });

    for (const account of accounts) {
      try {
        if (type === 'event.created') {
          const { messageId } = await this.telegramBotService.sendMessage(
            account.telegramChatId,
            text,
          );

          await this.prisma.eventTelegramMessage.upsert({
            where: {
              eventId_subscriberId: {
                eventId: event.id,
                subscriberId: account.userId,
              },
            },
            create: {
              eventId: event.id,
              subscriberId: account.userId,
              telegramMessageId: messageId,
            },
            update: {
              telegramMessageId: messageId,
            },
          });
          continue;
        }

        const stored = await this.prisma.eventTelegramMessage.findUnique({
          where: {
            eventId_subscriberId: {
              eventId: event.id,
              subscriberId: account.userId,
            },
          },
        });

        if (!stored) {
          continue;
        }

        await this.telegramBotService.editMessageText(
          account.telegramChatId,
          stored.telegramMessageId,
          text,
        );
      } catch (error) {
        if (this.telegramBotService.isForbiddenError(error)) {
          await this.prisma.telegramAccount.update({
            where: { id: account.id },
            data: { isActive: false },
          });
          this.logger.warn(
            `Telegram 403 for user ${account.userId}, account deactivated`,
          );
          continue;
        }

        this.logger.error(
          `Failed telegram notify user=${account.userId} type=${type}`,
          error instanceof Error ? error.stack : undefined,
        );
        throw error;
      }
    }
  }
}
