import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthController } from './api/auth.controller';
import { UsersController } from './api/users.controller';
import { AuthService } from './application/auth.service';
import { CryptoService } from './application/crypto.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersFactory } from './application/factories/users.factory';
import { GetUserByIdQueryHandler } from './application/queries/get-user-by-id.query';
import { CreateUserUseCase } from './application/usecases/create-user.usecase';
import { DeleteUserUseCase } from './application/usecases/delete-user.usecase';
import { RegisterUserUseCase } from './application/usecases/register-user.usecase';
import { UsersService } from './application/users.service';
import { User, UserSchema } from './domain/user.entity';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { AuthRepository } from './infrastructure/auth.repository';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { UsersRepository } from './infrastructure/users.repository';
import { LocalStrategy } from '../../modules/user-accounts/guards/local/local.strategy';
import { EmailService } from '../notifications/application/email.service';
import { GetAllUsersQueryHandler } from './application/queries/get-all-users.query';
import { LoginUserUsecase } from './application/usecases/login-user.usecase';
import { UsersConfig } from './users.config';

const commandHandlers = [
  DeleteUserUseCase,
  RegisterUserUseCase,
  LoginUserUsecase,
  CreateUserUseCase,
];

const queryHandlers = [GetUserByIdQueryHandler, GetAllUsersQueryHandler];

@Module({
  imports: [
    //если в системе несколько токенов (например, access и refresh) с разными опциями (время жизни, секрет)
    //можно переопределить опции при вызове метода jwt.service.sign
    //или написать свой tokens сервис (адаптер), где эти опции будут уже учтены
    //или использовать useFactory и регистрацию через токены для JwtService,
    //для создания нескольких экземпляров в IoC с разными настройками (пример в следующих занятиях)
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: 'access-token-secret', //TODO: move to env. will be in the following lessons
      signOptions: { expiresIn: '15m' }, // Время жизни токена
    }),
    NotificationsModule,
  ],
  controllers: [UsersController, AuthController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    UsersRepository,
    UsersService,
    EmailService,
    AuthRepository,
    AuthService,
    UsersQueryRepository,
    // SecurityDevicesQueryRepository,
    AuthQueryRepository,
    LocalStrategy,
    CryptoService,
    // LoginUserUseCase,
    JwtStrategy,
    // UsersExternalQueryRepository,
    // UsersExternalService,
    UsersFactory,
    UsersConfig,
  ],
  exports: [JwtStrategy, MongooseModule],
})
export class UserAccountsModule {}
