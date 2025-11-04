import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';

import { EmailService } from '../../../notifications/application/email.service';
import { AuthSqlRepository } from '../../infrastructure/auth.sql-repository';
import { UsersSqlRepository } from '../../infrastructure/users.sql-repository';
import { CryptoService } from '../crypto.service';

export class ResendEmailConfirmationCommand {
  constructor(public email: string) {}
}

@CommandHandler(ResendEmailConfirmationCommand)
export class ResendEmailConfirmationUseCase
  implements ICommandHandler<ResendEmailConfirmationCommand, void>
{
  constructor(
    private authSqlRepository: AuthSqlRepository,
    private usersSqlRepository: UsersSqlRepository,
    private cryptoService: CryptoService,
    private emailService: EmailService,
  ) {}

  async execute({ email }: ResendEmailConfirmationCommand): Promise<void> {
    const users = await this.usersSqlRepository.findByLoginOrEmail(email);
    console.log(users);

    if (users.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User not found',
        errorsMessages: [{ message: 'User not found', field: 'email' }],
      });
    }
    if (users[0].is_email_confirmed === true) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email already confirmed',
        errorsMessages: [{ message: 'Email already confirmed', field: 'email' }],
      });
    }

    const { confirmationCode, confirmationCodeExpiration } =
      this.cryptoService.generateConfirmation();

    await this.authSqlRepository.setUserConfirmation({
      email: email,
      confirmationCode: confirmationCode,
      confirmationCodeExpiration: confirmationCodeExpiration,
    });

    this.emailService.sendConfirmationEmail(email, confirmationCode);
    return;
  }
}
