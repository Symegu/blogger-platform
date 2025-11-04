import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
//import { AuthSqlRepository } from '../../infrastructure/auth.sql-repository';
//import { AuthSqlQueryRepository } from '../../infrastructure/query/auth-sql.query-repository';
import { EmailService } from 'src/modules/notifications/application/email.service';
import { CryptoService } from '../crypto.service';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';
import { UsersSqlRepository } from '../../infrastructure/users.sql-repository';
import { AuthSqlRepository } from '../../infrastructure/auth.sql-repository';

export class PasswordRecoveryCommand {
  constructor(public email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase implements ICommandHandler<PasswordRecoveryCommand, void> {
  constructor(
    private emailService: EmailService,
    private cryptoService: CryptoService,
    private authSqlRepository: AuthSqlRepository,
    private usersSqlRepository: UsersSqlRepository,
  ) {}

  async execute({ email }: PasswordRecoveryCommand): Promise<void> {
    const users = await this.usersSqlRepository.findByLoginOrEmail(email);
    if (users.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User not found',
        errorsMessages: [{ message: 'User not found', field: 'email' }],
      });
    }
    if (users[0].isEmailConfirmed === true) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email is not confirmed',
        errorsMessages: [{ message: 'Email is not confirmed', field: 'email' }],
      });
    }
    const { confirmationCode, confirmationCodeExpiration } =
      this.cryptoService.generateConfirmation();
    await this.authSqlRepository.setUserRecovery({
      email,
      recoveryCode: confirmationCode,
      recoveryCodeExpiration: confirmationCodeExpiration,
    });
    this.emailService.sendRecoveryPasswordEmail(email, confirmationCode);
    return;
  }
}
