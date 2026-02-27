import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenModule } from '@/shared/token/token.module';
import { SessionModule } from '@/shared/session/session.module';

const AVERAGE_EXPIRATION_TIME = '15m';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'fallback_secret',
      signOptions: { expiresIn: AVERAGE_EXPIRATION_TIME },
    }),
    TokenModule,
    SessionModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
