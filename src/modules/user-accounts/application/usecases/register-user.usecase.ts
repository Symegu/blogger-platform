import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateUserDto } from '../../dto/create-user.dto';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CryptoService } from '../crypto.service';
import { UsersFactory } from '../factories/users.factory';

export class RegisterUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<RegisterUserCommand, void> {
  constructor(
    private usersRepository: UsersRepository,
    private usersFactory: UsersFactory,
    private cryptoService: CryptoService,
  ) {}
  async execute({ dto }: RegisterUserCommand): Promise<void> {
    const user = await this.usersFactory.create(dto);
    const confirmation = this.cryptoService.generateConfirmation();
    user.setUserConfirmationInfo(
      confirmation.confirmationCode,
      confirmation.confirmationCodeExpiration,
    );
    await this.usersRepository.save(user);
  }
}
