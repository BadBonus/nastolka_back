import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot, GrammyError } from 'grammy';
import { PrismaService } from '@/prisma/prisma.service';
import { TelegramConnectTokenService } from './telegram-connect-token.service';
import {
  TelegramNotificationJobData,
  TelegramNotificationJobType,
} from './telegram.constants';

@Injectable()
export class TelegramBotService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramBotService.name);
  private bot: Bot | null = null;
  private readonly frontendUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly connectTokenService: TelegramConnectTokenService,
  ) {
    this.frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
  }

  async onModuleInit() {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token || token === 'your_telegram_bot_token') {
      this.logger.warn(
        'TELEGRAM_BOT_TOKEN не задан — бот и отправка сообщений отключены',
      );
      return;
    }

    this.bot = new Bot(token);

    this.bot.command('start', async (ctx) => {
      const raw = ctx.match?.toString().trim() ?? '';
      if (!raw) {
        await ctx.reply(
          'Чтобы привязать аккаунт, получите ссылку в приложении (POST /telegram/connect-link).',
        );
        return;
      }

      const userId = await this.connectTokenService.consumeToken(raw);
      if (!userId) {
        await ctx.reply(
          'Ссылка недействительна или истекла. Запросите новую в приложении.',
        );
        return;
      }

      const chatId = String(ctx.chat.id);

      await this.prisma.telegramAccount.upsert({
        where: { userId },
        create: {
          userId,
          telegramChatId: chatId,
          isActive: true,
        },
        update: {
          telegramChatId: chatId,
          isActive: true,
        },
      });

      await ctx.reply('Telegram успешно привязан. Вы будете получать анонсы ивентов.');
    });

    this.bot.catch((err) => {
      this.logger.error(`Grammy error: ${err.message}`, err.stack);
    });

    void this.bot.start({
      onStart: () => this.logger.log('Telegram bot started (long polling)'),
    });
  }

  async onModuleDestroy() {
    if (this.bot) {
      await this.bot.stop();
    }
  }

  isReady(): boolean {
    return this.bot !== null;
  }

  buildMessageText(
    type: TelegramNotificationJobType,
    event: TelegramNotificationJobData['event'],
  ): string {
    const link = `${this.frontendUrl}/events/${event.slug}`;
    const startsAt = new Date(event.startsAt).toLocaleString('ru-RU');

    switch (type) {
      case 'event.created':
        return [
          '🎲 Новый ивент от организатора',
          '',
          `«${event.name}»`,
          `Начало: ${startsAt}`,
          link,
        ].join('\n');
      case 'event.updated':
        return [
          '✏️ Ивент обновлён',
          '',
          `«${event.name}»`,
          `Начало: ${startsAt}`,
          link,
        ].join('\n');
      case 'event.cancelled':
        return [
          '❌ Ивент отменён',
          '',
          `«${event.name}»`,
          event.cancelReason ? `Причина: ${event.cancelReason}` : '',
          link,
        ]
          .filter(Boolean)
          .join('\n');
      default:
        return `«${event.name}»\n${link}`;
    }
  }

  async sendMessage(
    chatId: string,
    text: string,
  ): Promise<{ messageId: number }> {
    if (!this.bot) {
      throw new Error('Telegram bot is not initialized');
    }

    const message = await this.bot.api.sendMessage(chatId, text);
    return { messageId: message.message_id };
  }

  async editMessageText(
    chatId: string,
    messageId: number,
    text: string,
  ): Promise<void> {
    if (!this.bot) {
      throw new Error('Telegram bot is not initialized');
    }

    await this.bot.api.editMessageText(chatId, messageId, text);
  }

  isForbiddenError(error: unknown): boolean {
    return (
      error instanceof GrammyError &&
      (error.error_code === 403 || error.description?.includes('Forbidden'))
    );
  }
}
