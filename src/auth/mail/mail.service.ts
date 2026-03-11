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

  async sendPasswordResetLink(email: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
    await this.mailerService.sendMail({
      to: email,
      subject: 'Восстановление пароля',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Забыли пароль?</h2>
          <p>Ничего страшного, это бывает. Нажмите на кнопку ниже, чтобы установить новый пароль:</p>
          <a href="${resetUrl}" 
             style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">
            Сбросить пароль
          </a>
          <p>Ссылка действительна 1 час.</p>
          <p>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
        </div>
      `,
    });
  }
}
