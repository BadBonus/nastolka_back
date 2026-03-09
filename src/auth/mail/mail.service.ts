// src/shared/mail/mail.service.ts
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationCode(email: string, code: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Код подтверждения регистрации',
        html: `
          <div style="font-family: Arial, sans-serif; text-align: center;">
            <h1>Добро пожаловать!</h1>
            <p>Твой код подтверждения:</p>
            <h2 style="color: #3b82f6; letter-spacing: 5px;">${code}</h2>
            <p>Код действителен 15 минут.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Ошибка отправки почты:', error);
      throw new InternalServerErrorException('Не удалось отправить письмо');
    }
  }
}
