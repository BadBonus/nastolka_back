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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  VerifyEmailDto,
  ResetPasswordRequestDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { WEEK_IN_MS } from '@/utils/vars';
import { LoginResponse } from './auth.controller.response';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { REFRESH_TOKEN_NAME } from './utils';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
} as const;

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiCreatedResponse({
    description: 'Успешный вход',
    type: LoginResponse,
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
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
    return { message: 'Регистрация прошла успешно' };
  }

  @Post('verify-email')
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.verifyEmail(dto);

    res.cookie(REFRESH_TOKEN_NAME, refreshToken, {
      maxAge: WEEK_IN_MS,
      ...COOKIE_OPTIONS,
    });

    return { accessToken };
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

  @Post('reset-password/request')
  async resetPasswordRequest(@Body() dto: ResetPasswordRequestDto) {
    return await this.authService.resetPasswordRequest(dto.email);
  }

  @Get('reset-password/validate')
  async validateToken(@Query('token') token: string) {
    return await this.authService.validateResetToken(token);
  }

  @ApiOperation({ summary: 'Сброс пароля через токен' })
  @ApiResponse({ status: 200, description: 'Пароль успешно изменен' })
  @ApiResponse({ status: 400, description: 'Токен недействителен' })
  @Post('reset-password/confirm')
  async confirmReset(@Body() dto: ResetPasswordDto) {
    return await this.authService.resetPassword(dto);
  }
}
