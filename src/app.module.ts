import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './auth/mail/mail.module';
import { ProfileModule } from './profile/profile.module';
import { UploadsModule } from './common/modules/uploads/uploads.module';

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
  ],
})
export class AppModule {}
