import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SessionsRepository } from '../../infrastructure/sessions.repository';
import { SessionsService } from '../sessions.service';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';

export class RefreshTokensCommand {
  constructor(
    public readonly refreshToken: string,
    // public readonly res: Response,
    public readonly ip: string,
    public readonly title: string,
  ) {}
}

@CommandHandler(RefreshTokensCommand)
export class RefreshTokensUseCase implements ICommandHandler<RefreshTokensCommand> {
  constructor(
    private readonly sessionsRepository: SessionsRepository,
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
    const session = await this.sessionsRepository.findByTokenPayloadOrFail(payload);
    await this.sessionsRepository.updateSession({
      userId: session.userId,
      deviceId: session.deviceId,
      ip: ip,
      title: title,
      lastActiveDate: new Date(),
      expiresAt: new Date(Date.now() + 20 * 1000),
    });
    const newAccessToken = await this.sessionsService.accessTokenSign(session.userId);
    const newRefreshToken = await this.sessionsService.refreshTokenSign(
      session.userId,
      session.deviceId,
    );

    await this.sessionsRepository.invalidateToken(refreshToken);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
