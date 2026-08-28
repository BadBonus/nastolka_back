import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { SessionService } from '@/shared/session/session.service';
import { MailService } from '@/auth/mail/mail.service';
import { ImgproxyService } from '@/common/modules/imgproxy/imgproxy.service';
import { ERole } from '@/common/enums/roles.enum';

import {
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { Prisma } from '@pGen/client';
import type { User } from '@pGenTypes';
import type { TUser } from '@shared/types';
import * as argon2 from 'argon2';
import slugify from 'slugify';
import { randomBytes } from 'node:crypto';
import { buildImagePath } from '@/utils/pathToImg';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private sessionService: SessionService,
    private mailService: MailService,
    private imgproxyService: ImgproxyService,
  ) {}

  async login(
    dto: LoginDto,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const account = await this.prisma.account.findFirst({
      where: {
        provider: 'EMAIL',
        providerAccountId: dto.email,
      },
      include: {
        user: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!account || !account.passwordHash) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    const isPasswordValid = await argon2.verify(
      account.passwordHash,
      dto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    const user = account.user;

    if (user.avatar) {
      user.avatar = this.imgproxyService.generateSignedUrl(
        buildImagePath('avatars') + user.avatar,
        'avatar',
      );
    }

    const { accessToken, refreshToken } =
      await this.sessionService.createSession({
        id: user.id,
        email: user.email,
        nickname: user.nickname,
      });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: string, refreshToken: string) {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
    });

    if (!session || session.userId !== userId) {
      throw new UnauthorizedException('Invalid session');
    }

    await this.prisma.session.delete({
      where: { refreshToken },
    });
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar: true,
      },
    });

    if (user?.avatar) {
      user.avatar = this.imgproxyService.generateSignedUrl(
        buildImagePath('avatars') + user.avatar,
        'avatar',
      );
    }

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return user;
  }

  async refreshTokens(oldRefreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: TUser;
  }> {
    const { accessToken, refreshToken, userId } =
      await this.sessionService.refreshTokens(oldRefreshToken);

    const user = (await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar: true,
      },
    })) as TUser;

    if (user?.avatar) {
      user.avatar = this.imgproxyService.generateSignedUrl(
        buildImagePath('avatars') + user.avatar,
        'avatar',
      );
    }

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async register(dto: RegisterDto): Promise<string> {
    const { email, password, nickname, timezone } = dto;

    try {
      return await this.prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const existingUser = await tx.user.findUnique({ where: { email } });
          if (existingUser) {
            throw new ConflictException(
              'Пользователь с таким email уже существует',
            );
          }

          const defaultRole = await tx.role.findUnique({
            where: { name: ERole.USER },
          });

          if (!defaultRole) {
            throw new InternalServerErrorException(
              'Роль по умолчанию не найдена в базе данных',
            );
          }

          const passwordHash = await argon2.hash(password);
          const slug = await this.generateUniqueSlug(nickname);

          const newUser = await tx.user.create({
            data: {
              nickname,
              email,
              slug,
              roleId: defaultRole.id,
              ...(timezone && { timezone }),
            },
          });

          await tx.account.create({
            data: {
              userId: newUser.id,
              provider: 'EMAIL',
              providerAccountId: email,
              passwordHash,
            },
          });

          const code = Math.floor(100000 + Math.random() * 900000).toString();
          const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

          await tx.verificationCode.upsert({
            where: { email: newUser.email },
            update: { code, expiresAt },
            create: { email: newUser.email, code, expiresAt },
          });

          await this.mailService.sendVerificationCode(newUser.email, code);
          return 'Код подтверждения отправлен на почту';
        },
      );
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      console.error(error);
      throw new BadRequestException('Ошибка регистрации. Попробуйте позже.');
    }
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const { email, code } = dto;

    const verification = await this.prisma.verificationCode.findUnique({
      where: { email },
    });

    if (!verification || verification.code !== code) {
      throw new BadRequestException('Неверный код подтверждения');
    }

    if (new Date() > verification.expiresAt) {
      throw new BadRequestException(
        'Срок действия кода истек. Запросите новый.',
      );
    }

    return await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { email },
        data: { isVerified: true },
      });

      await tx.verificationCode.delete({
        where: { email },
      });

      const user = await tx.user.findUnique({ where: { email } });

      if (!user) {
        throw new BadRequestException('Пользователь не был найден');
      }

      return await this.sessionService.createSession(
        {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
        },
        tx,
      );
    });
  }

  async deleteUser(userId: string) {
    try {
      await this.prisma.user.delete({
        where: { id: userId }, //каскадное удаление сессий и аккаунтов настроено в Prisma
      });
    } catch (error) {
      throw new NotFoundException(`Пользователь с ID ${userId} не найден`);
    }
  }

  private async generateUniqueSlug(nickname: string): Promise<string> {
    const baseSlug = slugify(nickname, { lower: true, strict: true });

    const existingSlugs = await this.prisma.$queryRaw<{ slug: string }[]>`
      SELECT slug FROM users WHERE slug ~ ${'^' + baseSlug + '(-\\d+)?$'}
    `;

    if (existingSlugs.length === 0) {
      return baseSlug;
    }

    const usedNumbers = existingSlugs.map((row: any) => {
      const parts = row.slug.split('-');
      const lastPart = parts[parts.length - 1];
      return parseInt(lastPart) || 0;
    });

    const maxNumber = Math.max(...usedNumbers, 0);
    return `${baseSlug}-${maxNumber + 1}`;
  }

  async resetPasswordRequest(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return {
        message: 'Если email существует в системе, письмо будет отправлено',
      };
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 час

    await this.prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      update: { token, expiresAt },
      create: { userId: user.id, token, expiresAt },
    });

    await this.mailService.sendPasswordResetLink(email, token);

    return { message: 'Инструкции по сбросу пароля отправлены на почту' };
  }

  async validateResetToken(token: string) {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || new Date() > resetToken.expiresAt) {
      throw new BadRequestException('Ссылка устарела или недействительна');
    }

    return { valid: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { token, newPassword } = dto;

    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || new Date() > resetToken.expiresAt) {
      throw new BadRequestException('Ссылка недействительна');
    }

    await this.prisma.$transaction(async (tx) => {
      const passwordHash = await argon2.hash(newPassword);

      await tx.account.updateMany({
        where: { userId: resetToken.userId },
        data: { passwordHash },
      });

      await tx.passwordResetToken.delete({
        where: { token },
      });

      await tx.session.deleteMany({
        where: { userId: resetToken.userId },
      });
    });

    return { message: 'Пароль успешно изменен' };
  }
}
