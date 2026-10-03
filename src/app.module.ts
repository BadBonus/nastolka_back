import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './auth/mail/mail.module';
import { ProfileModule } from './profile/profile.module';
import { UploadsModule } from './common/modules/uploads/uploads.module';
import { EventModule } from './event/event.module';
// import { SupportModule } from './support/support.module';
import { OrgModule } from './org/org.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { DictionaryModule } from './dictionary/dictionary.module';
import { GeoModule } from './geo/geo.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { NotificationModule } from './notification/notification.module';
import { TelegramModule } from './telegram/telegram.module';
import { getRedisConnectionOptions } from '@/shared/redis/redis-connection';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    EventEmitterModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: getRedisConnectionOptions(configService),
      }),
    }),
    AuthModule,
    PrismaModule,
    MailModule,
    ProfileModule,
    UploadsModule,
    OrgModule,
    EventModule,
    DictionaryModule,
    GeoModule,
    SubscriptionModule,
    NotificationModule,
    TelegramModule,
    // SupportModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
