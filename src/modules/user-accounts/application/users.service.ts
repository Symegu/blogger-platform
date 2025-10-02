import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/user.entity';
import { CreateUserDto, UpdateUserDto } from '../dto/create-user.dto';
import { UsersRepository } from '../infrastructure/users.repository';
import { CryptoService } from './crypto.service';
import {
  DomainException,
  DomainExceptionCode,
  Extension,
} from 'src/core/exceptions/domain-exception';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';

@Injectable()
export class UsersService {
  constructor(
    //инжектирование модели в сервис через DI
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private cryptoService: CryptoService,
    private usersRepository: UsersRepository,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async createUser(dto: CreateUserDto): Promise<string> {
    //TODO: move to brypt service

    const userByLogin = await this.usersQueryRepository.findByLogin(dto.login);
    if (userByLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Login already exists',
        errorsMessages: [new Extension('Login already exists', 'login')],
      });
    }

    const userByEmail = await this.usersQueryRepository.findByEmail(dto.email);
    if (userByEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email already exists',
        errorsMessages: [new Extension('Email already exists', 'email')],
      });
    }

    const passwordHash = await this.cryptoService.createHash(dto.password);
    const confirmation = this.generateConfirmation();
    const user = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      passwordHash: passwordHash,
      confirmationCode: confirmation.confirmationCode,
      confirmationCodeExpiration: confirmation.confirmationCodeExpiration,
    });
    console.log('dto', dto);
    await this.usersRepository.save(user);
    console.log('create', user);

    return user._id.toString();
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<string> {
    const user = await this.usersRepository.findOrNotFoundFail(id);

    user.update(dto);

    await this.usersRepository.save(user);

    return user._id.toString();
  }

  async deleteUser(id: string) {
    const user = await this.usersRepository.findOrNotFoundFail(id);

    user.makeDeleted();

    await this.usersRepository.save(user);
  }

  generateConfirmation() {
    const confirmationCode = uuidv4();
    const confirmationCodeExpiration = new Date();
    confirmationCodeExpiration.setHours(
      confirmationCodeExpiration.getHours() + 1,
    ); // код живёт 1 час

    return { confirmationCode, confirmationCodeExpiration };
  }
}
