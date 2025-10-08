import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import {
  DomainException,
  DomainExceptionCode,
  Extension,
} from 'src/core/exceptions/domain-exception';

import { CreateUserDto } from '../../dto/create-user.dto';
import { UsersQueryRepository } from '../../infrastructure/query/users.query-repository';
import { UsersRepository } from '../../infrastructure/users.repository';
import { UsersFactory } from '../factories/users.factory';

export class CreateUserCommand {
  constructor(public dto: CreateUserDto) {}
}

/**
 * Создание администратором пользователя через админскую панель
 */
@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand, Types.ObjectId> {
  constructor(
    private usersRepository: UsersRepository,
    private usersQueryRepository: UsersQueryRepository,
    // @InjectModel(User.name)
    private usersFactory: UsersFactory,
  ) {}

  async execute({ dto }: CreateUserCommand): Promise<Types.ObjectId> {
    const uniqueEmail = await this.usersQueryRepository.findByEmail(dto.email);
    if (uniqueEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Login already exists',
        errorsMessages: [new Extension('Login already exists', 'login')],
      });
    }

    const uniqueLogin = await this.usersQueryRepository.findByEmail(dto.login);
    if (uniqueLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email already exists',
        errorsMessages: [new Extension('Email already exists', 'email')],
      });
    }
    const user = await this.usersFactory.create(dto);

    user.isEmailConfirmed = true;
    await this.usersRepository.save(user);

    return user._id;
  }
}
