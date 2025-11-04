import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
//import { AuthSqlRepository } from '../../infrastructure/auth.sql-repository';
//import { AuthSqlQueryRepository } from '../../infrastructure/query/auth-sql.query-repository';
import { EmailService } from 'src/modules/notifications/application/email.service';
import { CryptoService } from '../crypto.service';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';
import { UsersSqlRepository } from '../../infrastructure/users.sql-repository';
import { AuthSqlRepository } from '../../infrastructure/auth.sql-repository';
import { AuthSqlQueryRepository } from '../../infrastructure/query/auth-sql.query-repository';

export class ChangePasswordCommand {
  constructor(
    public newPassword: string,
    public recoveryCode: string,
  ) {}
}

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordUseCase implements ICommandHandler<ChangePasswordCommand, void> {
  constructor(
    private cryptoService: CryptoService,
    private authSqlQueryRepository: AuthSqlQueryRepository,
    private authSqlRepository: AuthSqlRepository,
  ) {}

  async execute({ newPassword, recoveryCode }: ChangePasswordCommand): Promise<void> {
    const user = await this.authSqlQueryRepository.getUserByRecoveryCode(recoveryCode);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User not found',
        errorsMessages: [{ message: 'User not found', field: 'email' }],
      });
    }
    const hashPassword = await this.cryptoService.createHash(newPassword);
    await this.authSqlRepository.setNewUserPassword(user.email, hashPassword);
    return;
  }
}
