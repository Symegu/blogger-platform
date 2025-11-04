import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateUserDto } from '../../dto/create-user.dto';
import { UsersSqlRepository } from '../../infrastructure/users.sql-repository';
import { AuthService } from '../auth.service';
import { UsersFactory } from '../factories/users.factory';

export class CreateUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private usersSqlRepository: UsersSqlRepository,
    private authService: AuthService,
    private usersFactory: UsersFactory,
  ) {}

  async execute({ dto }: CreateUserCommand): Promise<number> {
    await this.authService.ensureUserUniqueness(dto.email, dto.login);
    const user = await this.usersFactory.create(dto);
    const newUserId = await this.usersSqlRepository.adminCreate(user);
    return newUserId;
  }
}
