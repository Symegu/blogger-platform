import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
//import { SessionsRepository } from '../../infrastructure/sessions.repository';
import { SessionsService } from '../sessions.service';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';
import { SessionsSqlRepository } from '../../infrastructure/sessions.sql-repository';
import { SessionsSqlQueryRepository } from '../../infrastructure/query/sessions-sql.query-repository';

export class TerminateDeviceSessionCommand {
  constructor(
    public readonly deviceId: string,
    public readonly refreshToken: string,
  ) {}
}

@CommandHandler(TerminateDeviceSessionCommand)
export class TerminateDeviceSessionUseCase
  implements ICommandHandler<TerminateDeviceSessionCommand>
{
  constructor(
    private readonly sessionsSqlRepository: SessionsSqlRepository,
    private readonly sessionsSqlQueryRepository: SessionsSqlQueryRepository,
    private sessionsService: SessionsService,
  ) {}

  async execute({ deviceId, refreshToken }: TerminateDeviceSessionCommand): Promise<void> {
    if (!refreshToken) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'No refresh token provided',
      });
    }
    const payload = await this.sessionsService.validateRefreshToken(refreshToken);
    const session = await this.sessionsSqlRepository.findByTokenPayloadOrFail(payload);
    await this.validateDeviceOwner(session.user_id, deviceId);
    console.log('session', session);

    await this.sessionsSqlRepository.invalidateSession(session.user_id, deviceId);
    console.log('invalidate fine');

    //await this.sessionsRepository.invalidateToken(refreshToken);
    return;
  }

  private async validateDeviceOwner(currentUserId: number, targetDeviceId: string): Promise<void> {
    // Находим сессию по deviceId
    const targetSession = await this.sessionsSqlQueryRepository.findDataByDeviceId(targetDeviceId);

    if (!targetSession) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Session not found',
      });
    }
    console.log(
      'Target session user_id:',
      targetSession.user_id,
      'Current user id:',
      currentUserId,
    );
    if (targetSession.user_id !== currentUserId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'You can only terminate your own sessions',
      });
    }
  }
}
