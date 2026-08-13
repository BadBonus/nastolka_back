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
  HttpCode,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  ApiTags,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiBearerAuth,
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
import type { TUser } from '@shared/types';
import { LoginResponse } from './dto/login-response.dto';
import { User } from './entities/user.entity';

import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { REFRESH_TOKEN_NAME } from './utils';

const isProduction = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction, //В продашкене используем лишь https-соеденения
  sameSite: 'lax',
  path: '/',
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
      user: plainToInstance(User, result.user),
      accessToken: result.accessToken,
    };
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    await this.authService.register(dto);
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
  @ApiBearerAuth()
  @Get('me')
  @ApiOkResponse({
    description: 'Получения ограниченных минимальных данных юзера',
    type: User,
  })
  async getMe(@Req() req: any) {
    const userId = req.user.userId;
    return await this.authService.me(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('me')
  async selfDelete(
    @Req() req: { user: { id: number } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user.id;
    await this.authService.deleteUser(userId);
    res.clearCookie(REFRESH_TOKEN_NAME);
    return true;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async logout(
    @Req() req: Request & { user: { id: number } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies[REFRESH_TOKEN_NAME];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    await this.authService.logout(req.user.id, refreshToken);

    res.clearCookie(REFRESH_TOKEN_NAME, COOKIE_OPTIONS);

    return { message: 'Успешный выход' };
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Обновление сессии и получение данных пользователя',
    type: LoginResponse,
  })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; user: TUser }> {
    const oldRefreshToken = req.cookies[REFRESH_TOKEN_NAME];

    if (!oldRefreshToken)
      throw new UnauthorizedException('Refresh token not found');

    try {
      const { accessToken, refreshToken, user } =
        await this.authService.refreshTokens(oldRefreshToken);

      console.log('COOKIE SET, headers:', res.getHeaders());
      console.log(accessToken, refreshToken, user);

      res.cookie(REFRESH_TOKEN_NAME, refreshToken, {
        maxAge: WEEK_IN_MS,
        ...COOKIE_OPTIONS,
      });

      res.cookie(REFRESH_TOKEN_NAME, refreshToken, {
        maxAge: WEEK_IN_MS,
        ...COOKIE_OPTIONS,
      });

      return { accessToken, user };
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
