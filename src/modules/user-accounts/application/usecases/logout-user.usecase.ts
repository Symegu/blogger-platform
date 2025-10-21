// src/modules/auth/use-cases/logout.usecase.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SessionsRepository } from '../../infrastructure/sessions.repository';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';
import { SessionsService } from '../sessions.service';

export class LogoutUserCommand {
  constructor(
    public readonly refreshToken: string,
    // public readonly ip: string,
    // public readonly title: string,
  ) {}
}

@CommandHandler(LogoutUserCommand)
export class LogoutUseCase implements ICommandHandler<LogoutUserCommand, void> {
  constructor(
    private readonly sessionsRepository: SessionsRepository,
    private sessionsService: SessionsService,
  ) {}

  async execute({ refreshToken }: LogoutUserCommand): Promise<void> {
    if (!refreshToken) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'No refresh token provided',
      });
    }
    const payload = await this.sessionsService.validateRefreshToken(refreshToken);
    const session = await this.sessionsRepository.findByTokenPayloadOrFail(payload);
    console.log('session', session);
    await this.sessionsRepository.invalidateToken(refreshToken);
    await this.sessionsRepository.deleteByDeviceId(session.userId, session.deviceId);
    return;
  }
}
