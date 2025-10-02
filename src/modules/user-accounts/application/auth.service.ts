import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from './crypto.service';
import { UserContextDto } from '../dto/create-user.dto';
import { AuthRepository } from '../infrastructure/auth.repository';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { UsersService } from './users.service';
import {
  DomainException,
  DomainExceptionCode,
} from 'src/core/exceptions/domain-exception';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private usersQueryRepository: UsersQueryRepository,
    private authRepository: AuthRepository,
    private jwtService: JwtService,
    private cryptoService: CryptoService,
    private usersService: UsersService,
  ) {}
  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
    if (!user) {
      return null;
    }

    const validPassword = await this.cryptoService.comparePassword(
      password,
      user.passwordHash,
    );

    if (!validPassword) {
      return null;
    }
    return { id: user.id.toString(), login: user.login, email: user.email };
  }

  async login(userId: string): Promise<{ accessToken: string }> {
    const accessToken = await this.jwtService.sign({
      id: userId,
    } as UserContextDto);
    return { accessToken: accessToken };
  }

  async confirmUserEmail(email: string) {
    return await this.authRepository.confirmUserEmail(email);
  }

  async changeEmailConfirmation(email: string) {
    const user = await this.usersQueryRepository.findByEmail(email);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User not found',
        errorsMessages: [{ message: 'User not found', field: 'email' }],
      });
    }
    if (!user.isEmailConfirmed === false) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email already confirmed',
        errorsMessages: [
          { message: 'Email already confirmed', field: 'email' },
        ],
      });
    }

    const { confirmationCode, confirmationCodeExpiration } =
      this.usersService.generateConfirmation();
    return await this.authRepository.setUserConfirmation({
      email,
      confirmationCode,
      confirmationCodeExpiration,
    });
  }

  async getPasswordRecovery(email: string) {
    const user = await this.usersQueryRepository.findByEmail(email);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User not found',
        errorsMessages: [{ message: 'User not found', field: 'email' }],
      });
    }
    if (!user.isEmailConfirmed === true) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email is not confirmed',
        errorsMessages: [{ message: 'Email is not confirmed', field: 'email' }],
      });
    }
    const { confirmationCode, confirmationCodeExpiration } =
      this.usersService.generateConfirmation();
    return await this.authRepository.setUserRecovery({
      email,
      recoveryCode: confirmationCode,
      recoveryCodeExpiration: confirmationCodeExpiration,
    });
  }

  async changeUserPassword(email: string, newPassword: string) {
    const user = await this.usersQueryRepository.findByEmail(email);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User not found',
        errorsMessages: [{ message: 'User not found', field: 'email' }],
      });
    }
    const hashPassword = await this.cryptoService.createHash(newPassword);
    return await this.authRepository.setNewUserPassword(
      user.email,
      hashPassword,
    );
  }
}
