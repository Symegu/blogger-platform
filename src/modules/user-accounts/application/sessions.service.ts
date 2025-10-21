import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserAccountsConfig } from '../user-accounts.config';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../constants/auth-tokens.inject-constant';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';
import { Types } from 'mongoose';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { SessionsRepository } from '../infrastructure/sessions.repository';

@Injectable()
export class SessionsService {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private jwtService: JwtService,
    private userAccountsConfig: UserAccountsConfig,
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
    private sessionsRepository: SessionsRepository,
  ) {}

  async validateRefreshToken(refreshToken: string) {
    await this.sessionsRepository.isTokenRevoked(refreshToken);
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.userAccountsConfig.refreshTokenSecret,
      });
      return payload;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new DomainException({
          code: DomainExceptionCode.Unauthorized,
          message: 'TokenExpiredError',
        });
      }
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'No refresh token provided',
      });
    }
  }

  async accessTokenSign(userId: Types.ObjectId, login?: string) {
    const user = await this.usersQueryRepository.getByIdOrNotFoundFail(userId);
    const accessToken = this.accessTokenContext.sign({
      userId: userId,
      login: login ? login : user.login,
    });

    return accessToken;
  }

  async refreshTokenSign(userId: Types.ObjectId, deviceId: Types.ObjectId) {
    const refreshToken = this.refreshTokenContext.sign({
      userId: userId,
      deviceId: deviceId,
    });
    return refreshToken;
  }
}
