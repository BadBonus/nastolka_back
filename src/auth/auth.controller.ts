import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Res,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/register.dto';
import { WEEK_IN_MS } from '@/utils/vars';
import type { TSucAuthFB } from '@/shared/types';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { REFRESH_TOKEN_NAME } from './utils';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
} as const;

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TSucAuthFB> {
    const result = await this.authService.login(dto);
    res.cookie(REFRESH_TOKEN_NAME, result.refreshToken, {
      maxAge: WEEK_IN_MS,
      ...COOKIE_OPTIONS,
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

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: { user: { id: number } }) {
    return await this.authService.me(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async selfDelete(
    @Req() req: { user: { id: number } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user.id;
    await this.authService.deleteUser(userId);
    res.clearCookie(REFRESH_TOKEN_NAME);
    return { message: 'Ваш аккаунт был успешно удален' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies[REFRESH_TOKEN_NAME];

    if (refreshToken) await this.authService.logout(refreshToken);

    res.clearCookie(REFRESH_TOKEN_NAME, {
      path: '/',
      ...COOKIE_OPTIONS,
    });

    return { message: 'Успешный выход' };
  }

  @Post('refresh')
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const oldRefreshToken = req.cookies[REFRESH_TOKEN_NAME];
    if (!oldRefreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const { accessToken, refreshToken } =
        await this.authService.refreshTokens(oldRefreshToken);
      res.cookie(REFRESH_TOKEN_NAME, refreshToken, {
        maxAge: WEEK_IN_MS,
        ...COOKIE_OPTIONS,
      });
      return { accessToken };
    } catch (error) {
      res.clearCookie(REFRESH_TOKEN_NAME, { ...COOKIE_OPTIONS, path: '/' });
      throw new UnauthorizedException('Session expired');
    }
  }
}
