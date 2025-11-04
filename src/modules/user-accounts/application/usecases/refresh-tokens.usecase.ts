import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';

import { SessionsSqlRepository } from '../../infrastructure/sessions.sql-repository';
import { SessionsService } from '../sessions.service';

export class RefreshTokensCommand {
  constructor(
    public readonly refreshToken: string,
    public readonly ip: string,
    public readonly title: string,
  ) {}
}

@CommandHandler(RefreshTokensCommand)
export class RefreshTokensUseCase implements ICommandHandler<RefreshTokensCommand> {
  constructor(
    private readonly sessionsSqlRepository: SessionsSqlRepository,
    private sessionsService: SessionsService,
  ) {}

  async execute({ refreshToken, ip, title }: RefreshTokensCommand) {
    if (!refreshToken) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'No refresh token provided',
      });
    }
    const payload = await this.sessionsService.validateRefreshToken(refreshToken);

    const session = await this.sessionsSqlRepository.findByTokenPayloadOrFail({
      userId: payload.userId,
      deviceId: payload.deviceId,
    });

    await this.sessionsSqlRepository.updateSession({
      userId: session.user_id,
      deviceId: session.device_id,
      ip: ip,
      title: title,
      lastActiveDate: new Date(),
      expiresAt: new Date(Date.now() + 20 * 1000),
    });

    const newAccessToken = await this.sessionsService.accessTokenSign(session.user_id);
    const newRefreshToken = await this.sessionsService.refreshTokenSign(
      session.user_id,
      session.device_id,
    );

    await this.sessionsSqlRepository.invalidateToken(refreshToken);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
