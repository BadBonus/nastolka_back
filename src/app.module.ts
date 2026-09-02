import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './auth/mail/mail.module';
import { ProfileModule } from './profile/profile.module';
import { UploadsModule } from './common/modules/uploads/uploads.module';
import { EventModule } from './event/event.module';
// import { SupportModule } from './support/support.module';
import { OrgModule } from './org/org.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MailModule,
    ProfileModule,
    UploadsModule,
    OrgModule,
    EventModule,
    // SupportModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
