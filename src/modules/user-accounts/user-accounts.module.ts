import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
//import { MongooseModule } from '@nestjs/mongoose';

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
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './constants/auth-tokens.inject-constant';
// import { Session, SessionSchema } from './domain/session.entity';
// import { User, UserSchema } from './domain/user.entity';
import { RefreshTokenStrategy } from './guards/apikey/refresh-token.strategy';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
// import { AuthRepository } from './infrastructure/auth.repository';
// import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
// import { SessionsQueryRepository } from './infrastructure/query/sessions.query-repository';
// import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
// import { SessionsRepository } from './infrastructure/sessions.repository';
// import { UsersRepository } from './infrastructure/users.repository';
import { LocalStrategy } from '../../modules/user-accounts/guards/local/local.strategy';
import { EmailService } from '../notifications/application/email.service';
import { GetAllUsersQueryHandler } from './application/queries/get-all-users.query';
import { LoginUserUseCase } from './application/usecases/login-user.usecase';
import { UserAccountsConfig } from './user-accounts.config';
//import { RevokedToken, RevokedTokenSchema } from './domain/revoked-token.entity';
import { GetUserSessionsQueryHandler } from './application/queries/get-user-sessions.query';
import { TerminateOtherSessionsUseCase } from './application/usecases/terminate-other-sessions.usecase';
import { TerminateDeviceSessionUseCase } from './application/usecases/terminate-session.usecase';
import { UsersSqlQueryRepository } from './infrastructure/query/users-sql.query-repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersSqlRepository } from './infrastructure/users.sql-repository';
import { SessionsSqlQueryRepository } from './infrastructure/query/sessions-sql.query-repository';
import { SessionsSqlRepository } from './infrastructure/sessions.sql-repository';
import { AuthSqlQueryRepository } from './infrastructure/query/auth-sql.query-repository';
import { AuthSqlRepository } from './infrastructure/auth.sql-repository';
import { ConfirmEmailUseCase } from './application/usecases/confirm-email.usecase';
import { ResendEmailConfirmationUseCase } from './application/usecases/resend-email-confirmation.usecase';
import { PasswordRecoveryUseCase } from './application/usecases/password-recovery.usecase';
import { ChangePasswordUseCase } from './application/usecases/change-user-password.usecase';

const commandHandlers = [
  DeleteUserUseCase,
  RegisterUserUseCase,
  LoginUserUseCase,
  LogoutUseCase,
  CreateUserUseCase,
  RefreshTokensUseCase,
  TerminateOtherSessionsUseCase,
  TerminateDeviceSessionUseCase,
  ConfirmEmailUseCase,
  ResendEmailConfirmationUseCase,
  PasswordRecoveryUseCase,
  ChangePasswordUseCase,
];

const queryHandlers = [
  GetUserByIdQueryHandler,
  GetAllUsersQueryHandler,
  GetUserSessionsQueryHandler,
];

@Module({
  imports: [TypeOrmModule.forFeature([]), JwtModule, NotificationsModule],
  controllers: [UsersController, AuthController, SessionsController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    EmailService,
    AuthService,
    SessionsService,
    UsersSqlRepository,
    UsersSqlQueryRepository,
    SessionsSqlQueryRepository,
    SessionsSqlRepository,
    AuthSqlQueryRepository,
    AuthSqlRepository,
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
