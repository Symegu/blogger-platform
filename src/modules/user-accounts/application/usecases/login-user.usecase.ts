import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SessionsSqlRepository } from '../../infrastructure/sessions.sql-repository';
import { SessionsService } from '../sessions.service';

export class LoginUserCommand {
  constructor(public dto: { userId: number; login: string; ip: string; title: string }) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    private sessionsService: SessionsService,
    private sessionsSqlRepository: SessionsSqlRepository,
  ) {}

  async execute({ dto }: LoginUserCommand): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.sessionsService.accessTokenSign(dto.userId, dto.login);
    const deviceId = Math.random().toString(36).substr(2, 9);
    const lastActiveDate = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    const refreshToken = await this.sessionsService.refreshTokenSign(
      dto.userId,
      deviceId.toString(),
    );
    await this.sessionsSqlRepository.createSession({
      userId: dto.userId,
      deviceId: deviceId,
      ip: dto.ip,
      title: dto.title,
      expiresAt: expiresAt,
      lastActiveDate: lastActiveDate,
    });
    return { accessToken: accessToken, refreshToken: refreshToken };
  }
}
