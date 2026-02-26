import { Controller, Post, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/register.dto';
import {WEEK_IN_MS} from "@/utils/vars";
import type { TSucAuthFB } from '@/shared/types';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ):Promise<TSucAuthFB> {
    const result = await this.authService.login(dto);

    res.cookie('refresh_token', result.refreshToken, {
    httpOnly: true,
    secure: true, 
    sameSite: 'lax',
    maxAge: WEEK_IN_MS,
  });

    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    await this.authService.register(dto);

    // NOTE: тут еще додумать логику регистрации, с последующей механикой подтверждения почты и т.д.
    return { message: 'Регистрация прошла успешно' };
  }
}
