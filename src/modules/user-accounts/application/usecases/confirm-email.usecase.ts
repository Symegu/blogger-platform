import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { AuthSqlRepository } from '../../infrastructure/auth.sql-repository';
import { AuthSqlQueryRepository } from '../../infrastructure/query/auth-sql.query-repository';

export class ConfirmEmailCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase implements ICommandHandler<ConfirmEmailCommand, void> {
  constructor(
    private authSqlRepository: AuthSqlRepository,
    private authSqlQueryRepository: AuthSqlQueryRepository,
  ) {}

  async execute({ code }: ConfirmEmailCommand): Promise<void> {
    const user = await this.authSqlQueryRepository.getUserByConfirmationCode(code);
    console.log('user1', user);

    return await this.authSqlRepository.confirmUserEmail(user.email);
  }
}
