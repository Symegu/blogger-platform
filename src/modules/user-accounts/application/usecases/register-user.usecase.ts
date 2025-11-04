import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailService } from 'src/modules/notifications/application/email.service';

import { CreateUserDto } from '../../dto/create-user.dto';
//import { UsersRepository } from '../../infrastructure/users.repository';
import { UsersSqlRepository } from '../../infrastructure/users.sql-repository';
import { AuthService } from '../auth.service';
import { CryptoService } from '../crypto.service';
import { UsersFactory } from '../factories/users.factory';

export class RegisterUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<RegisterUserCommand, void> {
  constructor(
    private usersSqlRepository: UsersSqlRepository,
    private usersFactory: UsersFactory,
    private authService: AuthService,
    private cryptoService: CryptoService,
    private emailService: EmailService,
  ) {}
  async execute({ dto }: RegisterUserCommand): Promise<void> {
    await this.authService.ensureUserUniqueness(dto.email, dto.login);
    const user = await this.usersFactory.create(dto);
    const confirmation = this.cryptoService.generateConfirmation();
    await this.usersSqlRepository.create(
      user,
      confirmation.confirmationCode,
      confirmation.confirmationCodeExpiration,
    );
    this.emailService.sendConfirmationEmail(user.email, confirmation.confirmationCode);
    return;
  }
}
