import {
  Controller,
  Post,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '@/auth/jwt/jwt-auth.guard';
import { plainToInstance } from 'class-transformer';
import { TelegramConnectTokenService } from './telegram-connect-token.service';
import { TelegramConnectLinkResponseDto } from './dto';

@ApiTags('Telegram')
@Controller('telegram')
export class TelegramController {
  constructor(
    private readonly connectTokenService: TelegramConnectTokenService,
    private readonly configService: ConfigService,
  ) {}

  @Post('connect-link')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Сгенерировать ссылку привязки Telegram (TTL 5 мин)' })
  @ApiResponse({ status: HttpStatus.CREATED, type: TelegramConnectLinkResponseDto })
  async createConnectLink(
    @Req() req: RequestWithUser,
  ): Promise<TelegramConnectLinkResponseDto> {
    const { token, expiresIn } = await this.connectTokenService.createToken(
      req.user.userId,
    );

    const username = this.configService.getOrThrow<string>(
      'TELEGRAM_BOT_USERNAME',
    );
    const url = `https://t.me/${username.replace(/^@/, '')}?start=${token}`;

    return plainToInstance(TelegramConnectLinkResponseDto, { url, expiresIn });
  }
}
