import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TelegramController } from './telegram.controller';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramConnectTokenService } from './telegram-connect-token.service';
import { TelegramNotificationsProcessor } from './telegram-notifications.processor';
import { TELEGRAM_NOTIFICATIONS_QUEUE } from './telegram.constants';

@Module({
  imports: [
    BullModule.registerQueue({
      name: TELEGRAM_NOTIFICATIONS_QUEUE,
    }),
  ],
  controllers: [TelegramController],
  providers: [
    TelegramBotService,
    TelegramConnectTokenService,
    TelegramNotificationsProcessor,
  ],
  exports: [TelegramBotService],
})
export class TelegramModule {}
