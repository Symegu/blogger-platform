import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendConfirmationEmail(email: string, code: string): Promise<void> {
    //can add html templates, implement advertising and other logic for mailing...
    await this.mailerService.sendMail({
      to: email, // <- вот сюда передаём получателя
      subject: 'Подтверждение регистрации',
      text: `Confirm registration via link: https://ceea78aa37495d.lhr.life?code=${code}`,
      // можешь добавить html, если хочешь красиво
      html: `<h3>Подтверждение регистрации</h3>
             <p>Пройдите по ссылке:</p>
             <a href="https://some.com?code=${code}">Подтвердить Email</a>`,
    });
  }

  async sendRecoveryPasswordEmail(email: string, code: string): Promise<void> {
    //can add html templates, implement advertising and other logic for mailing...
    await this.mailerService.sendMail({
      to: email, // <- вот сюда передаём получателя
      subject: 'Восстановление пароля',
      text: `Confirm registration via link: https://ceea78aa37495d.lhr.life?code=${code}`,
      // можешь добавить html, если хочешь красиво
      html: `<h3>Восстановление пароля</h3>
             <p>Пройдите по ссылке:</p>
             <a href="https://some.com?code=${code}">Cбросить пароль</a>`,
    });
  }
}
