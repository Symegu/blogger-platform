import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../infrastructure/sessions.repository';
import { SessionsService } from '../sessions.service';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';

export class TerminateOtherSessionsCommand {
  constructor(public readonly refreshToken: string) {}
}

@CommandHandler(TerminateOtherSessionsCommand)
export class TerminateOtherSessionsUseCase
  implements ICommandHandler<TerminateOtherSessionsCommand>
{
  constructor(
    private readonly sessionsRepository: SessionsRepository,
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
    const session = await this.sessionsRepository.findByTokenPayloadOrFail(payload);
    await this.sessionsRepository.deleteAllOtherDevices(session.userId, session.deviceId);
    return;
  }
}
