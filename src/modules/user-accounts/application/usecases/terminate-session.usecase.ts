import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../infrastructure/sessions.repository';
import { SessionsService } from '../sessions.service';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';
import { SessionsQueryRepository } from '../../infrastructure/query/sessions.query-repository';
import { Types } from 'mongoose';

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
    private readonly sessionsRepository: SessionsRepository,
    private readonly sessionsQueryRepository: SessionsQueryRepository,
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
    const session = await this.sessionsRepository.findByTokenPayloadOrFail(payload);
    await this.validateDeviceOwner(session.userId, deviceId);
    await this.sessionsRepository.deleteByDeviceId(session.userId, new Types.ObjectId(deviceId));
    //await this.sessionsRepository.invalidateToken(refreshToken);
    return;
  }

  private async validateDeviceOwner(
    currentUserId: Types.ObjectId,
    targetDeviceId: string,
  ): Promise<void> {
    // Находим сессию по deviceId
    const targetSession = await this.sessionsQueryRepository.findByDeviceId(targetDeviceId);

    if (!targetSession) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Session not found',
      });
    }

    if (!targetSession.userId.equals(currentUserId)) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'You can only terminate your own sessions',
      });
    }
  }
}
