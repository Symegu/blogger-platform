import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Types } from 'mongoose';

// import { CryptoService } from './crypto.service';
// import { User, UserModelType } from '../domain/user.entity';
// import { UpdateUserDto } from '../dto/create-user.dto';
// import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
// import { UsersRepository } from '../infrastructure/users.repository';

@Injectable()
export class UsersService {
  constructor() //инжектирование модели в сервис через DI
  // @InjectModel(User.name)
  // private UserModel: UserModelType,
  // private cryptoService: CryptoService,
  // private usersRepository: UsersRepository,
  // private usersQueryRepository: UsersQueryRepository,
  {}

  // async createUser(dto: CreateUserDto): Promise<string> {
  //   const userByLogin = await this.usersQueryRepository.findByLogin(dto.login);
  //   if (userByLogin) {
  //     throw new DomainException({
  //       code: DomainExceptionCode.BadRequest,
  //       message: 'Login already exists',
  //       errorsMessages: [new Extension('Login already exists', 'login')],
  //     });
  //   }

  //   const userByEmail = await this.usersQueryRepository.findByEmail(dto.email);
  //   if (userByEmail) {
  //     throw new DomainException({
  //       code: DomainExceptionCode.BadRequest,
  //       message: 'Email already exists',
  //       errorsMessages: [new Extension('Email already exists', 'email')],
  //     });
  //   }

  //   const passwordHash = await this.cryptoService.createHash(dto.password);
  //   const confirmation = this.cryptoService.generateConfirmation();
  //   const user = this.UserModel.createInstance({
  //     email: dto.email,
  //     login: dto.login,
  //     passwordHash: passwordHash,
  //     confirmationCode: confirmation.confirmationCode,
  //     confirmationCodeExpiration: confirmation.confirmationCodeExpiration,
  //   });
  //   console.log('dto', dto);
  //   await this.usersRepository.save(user);
  //   console.log('create', user);

  //   return user._id.toString();
  // }

  // async updateUser(id: Types.ObjectId, dto: UpdateUserDto): Promise<string> {
  //   const user = await this.usersRepository.findOrNotFoundFail(id);

  //   user.update(dto);

  //   await this.usersRepository.save(user);

  //   return user._id.toString();
  // }

  // s
}
