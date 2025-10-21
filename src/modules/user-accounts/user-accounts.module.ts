import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthController } from './api/auth.controller';
import { SessionsController } from './api/sessions.controller';
import { UsersController } from './api/users.controller';
import { AuthService } from './application/auth.service';
import { CryptoService } from './application/crypto.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersFactory } from './application/factories/users.factory';
import { GetUserByIdQueryHandler } from './application/queries/get-user-by-id.query';
import { SessionsService } from './application/sessions.service';
import { CreateUserUseCase } from './application/usecases/create-user.usecase';
import { DeleteUserUseCase } from './application/usecases/delete-user.usecase';
import { LogoutUseCase } from './application/usecases/logout-user.usecase';
import { RefreshTokensUseCase } from './application/usecases/refresh-tokens.usecase';
import { RegisterUserUseCase } from './application/usecases/register-user.usecase';
import { UsersService } from './application/users.service';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './constants/auth-tokens.inject-constant';
import { Session, SessionSchema } from './domain/session.entity';
import { User, UserSchema } from './domain/user.entity';
import { RefreshTokenStrategy } from './guards/apikey/refresh-token.strategy';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { AuthRepository } from './infrastructure/auth.repository';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { SessionsQueryRepository } from './infrastructure/query/sessions.query-repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { SessionsRepository } from './infrastructure/sessions.repository';
import { UsersRepository } from './infrastructure/users.repository';
import { LocalStrategy } from '../../modules/user-accounts/guards/local/local.strategy';
import { EmailService } from '../notifications/application/email.service';
import { GetAllUsersQueryHandler } from './application/queries/get-all-users.query';
import { LoginUserUseCase } from './application/usecases/login-user.usecase';
import { UserAccountsConfig } from './user-accounts.config';
import { RevokedToken, RevokedTokenSchema } from './domain/revoked-token.entity';
import { GetUserSessionsQueryHandler } from './application/queries/get-user-sessions.query';
import { TerminateOtherSessionsUseCase } from './application/usecases/terminate-other-sessions';
import { TerminateDeviceSessionUseCase } from './application/usecases/terminate-session.usecase';

const commandHandlers = [
  DeleteUserUseCase,
  RegisterUserUseCase,
  LoginUserUseCase,
  LogoutUseCase,
  CreateUserUseCase,
  RefreshTokensUseCase,
  TerminateOtherSessionsUseCase,
  TerminateDeviceSessionUseCase,
];

const queryHandlers = [
  GetUserByIdQueryHandler,
  GetAllUsersQueryHandler,
  GetUserSessionsQueryHandler,
];

@Module({
  imports: [
    //если в системе несколько токенов (например, access и refresh) с разными опциями (время жизни, секрет)
    //можно переопределить опции при вызове метода jwt.service.sign
    //или написать свой tokens сервис (адаптер), где эти опции будут уже учтены
    //или использовать useFactory и регистрацию через токены для JwtService,
    //для создания нескольких экземпляров в IoC с разными настройками (пример в следующих занятиях)
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
      { name: RevokedToken.name, schema: RevokedTokenSchema },
    ]),
    JwtModule,
    NotificationsModule,
  ],
  controllers: [UsersController, AuthController, SessionsController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    UsersRepository,
    UsersService,
    EmailService,
    AuthRepository,
    AuthService,
    SessionsService,
    UsersQueryRepository,
    SessionsQueryRepository,
    SessionsRepository,
    AuthQueryRepository,
    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (userAccountConfig: UserAccountsConfig): JwtService => {
        return new JwtService({
          secret: userAccountConfig.accessTokenSecret,
          signOptions: { expiresIn: userAccountConfig.accessTokenExpireIn },
        });
      },
      inject: [UserAccountsConfig],
    },
    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (userAccountConfig: UserAccountsConfig): JwtService => {
        return new JwtService({
          secret: userAccountConfig.refreshTokenSecret,
          signOptions: { expiresIn: userAccountConfig.refreshTokenExpireIn },
        });
      },
      inject: [UserAccountsConfig],
    },
    LocalStrategy,
    CryptoService,
    UserAccountsConfig,
    RefreshTokenStrategy,
    JwtStrategy,
    // UsersExternalQueryRepository,
    // UsersExternalService,
    UsersFactory,
  ],
  exports: [JwtStrategy, RefreshTokenStrategy],
})
export class UserAccountsModule {}
