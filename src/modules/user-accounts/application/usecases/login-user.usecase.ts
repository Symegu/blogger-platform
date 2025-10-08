import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';

export class LoginUserCommand {
  constructor(public dto: { userId: Types.ObjectId }) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUsecase implements ICommandHandler<LoginUserCommand> {
  constructor(private jwtService: JwtService) {}

  async execute({ dto }: LoginUserCommand): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.jwtService.sign({ id: dto.userId });
    const refreshToken = this.jwtService.sign({
      id: dto.userId,
      deviceId: 'deviceId',
    });
    console.log('refreshToken', refreshToken);
    return { accessToken: accessToken, refreshToken: refreshToken };
  }
}
