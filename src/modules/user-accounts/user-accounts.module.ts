import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { CryptoService } from './application/crypto.service';
import { AuthService } from './application/auth.service';
import { AuthController } from './api/auth.controller';
import { LocalStrategy } from '../../modules/user-accounts/guards/local/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { EmailService } from '../notifications/application/email.service';
import { AuthRepository } from './infrastructure/auth.repository';
import { NotificationsModule } from '../notifications/notifications.module';

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
      signOptions: { expiresIn: '60m' }, // Время жизни токена
    }),
    NotificationsModule,
  ],
  controllers: [UsersController, AuthController],
  providers: [
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    // SecurityDevicesQueryRepository,
    AuthQueryRepository,
    AuthRepository,
    AuthService,
    EmailService,
    LocalStrategy,
    CryptoService,
    JwtStrategy,
    // UsersExternalQueryRepository,
    // UsersExternalService,
  ],
  exports: [JwtStrategy],
})
export class UserAccountsModule {}
