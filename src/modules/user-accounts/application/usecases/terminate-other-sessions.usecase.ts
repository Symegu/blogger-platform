import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';

import { SessionsSqlRepository } from '../../infrastructure/sessions.sql-repository';
import { SessionsService } from '../sessions.service';

export class TerminateOtherSessionsCommand {
  constructor(public readonly refreshToken: string) {}
}

@CommandHandler(TerminateOtherSessionsCommand)
export class TerminateOtherSessionsUseCase
  implements ICommandHandler<TerminateOtherSessionsCommand>
{
  constructor(
    private readonly sessionsSqlRepository: SessionsSqlRepository,
    private sessionsService: SessionsService,
  ) {}

  async execute({ refreshToken }: TerminateOtherSessionsCommand): Promise<void> {
    if (!refreshToken) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'No refresh token provided',
      });
    }
    const payload = await this.sessionsService.validateRefreshToken(refreshToken);
    const session = await this.sessionsSqlRepository.findByTokenPayloadOrFail(payload);
    console.log('TerminateOtherSessionsCommand', session);

    await this.sessionsSqlRepository.deleteAllOtherDevices(session.user_id, session.device_id);
    return;
  }
}
