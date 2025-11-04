// src/modules/auth/use-cases/logout.usecase.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

//import { SessionsRepository } from '../../infrastructure/sessions.repository';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';
import { SessionsService } from '../sessions.service';
import { SessionsSqlRepository } from '../../infrastructure/sessions.sql-repository';

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
    private readonly sessionsSqlRepository: SessionsSqlRepository,
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
    const session = await this.sessionsSqlRepository.findByTokenPayloadOrFail(payload);
    console.log(session);
    await this.sessionsSqlRepository.invalidateSession(session.user_id, session.device_id);
    await this.sessionsSqlRepository.invalidateToken(refreshToken);
    return;
  }
}
