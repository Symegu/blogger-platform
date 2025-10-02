import { Module } from '@nestjs/common';
import { EmailService } from './application/email.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.yandex.ru',
        port: 465,
        // ignoreTLS: true,
        secure: true,
        auth: {
          user:
            process.env.MAILDEV_INCOMING_USER || 'testingNodemailer@yandex.ru',
          pass: process.env.MAILDEV_INCOMING_PASS || 'ygvmkdjhlyiorspd',
        },
      },
      defaults: {
        from: '"Blogger platform" <testingNodemailer@yandex.ru>',
      },
      //   template: {
      //     dir: __dirname + '/templates',
      //     adapter: new PugAdapter(),
      //     options: {
      //       strict: true,
      //     },
      //   },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class NotificationsModule {}
