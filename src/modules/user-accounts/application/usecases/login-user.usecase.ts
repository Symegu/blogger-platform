import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { SessionsService } from '../sessions.service';
import { SessionsRepository } from '../../infrastructure/sessions.repository';

export class LoginUserCommand {
  constructor(public dto: { userId: Types.ObjectId; login: string; ip: string; title: string }) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    private sessionsService: SessionsService,
    private sessionsRepository: SessionsRepository,
  ) {}

  async execute({ dto }: LoginUserCommand): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.sessionsService.accessTokenSign(dto.userId, dto.login);
    const deviceId = new Types.ObjectId();
    const refreshToken = await this.sessionsService.refreshTokenSign(dto.userId, deviceId);
    console.log(refreshToken);

    await this.sessionsRepository.createSession({
      userId: dto.userId,
      deviceId: deviceId,
      ip: dto.ip,
      title: dto.title,
    });
    return { accessToken: accessToken, refreshToken: refreshToken };
  }
}
