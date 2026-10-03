import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationListener } from './notification.listener';
import { SubscriptionModule } from '@/subscription/subscription.module';
import { TELEGRAM_NOTIFICATIONS_QUEUE } from '@/telegram/telegram.constants';

@Module({
  imports: [
    SubscriptionModule,
    BullModule.registerQueue({
      name: TELEGRAM_NOTIFICATIONS_QUEUE,
    }),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationListener],
})
export class NotificationModule {}
