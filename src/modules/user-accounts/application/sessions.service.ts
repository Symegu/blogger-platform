import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';

import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../constants/auth-tokens.inject-constant';
import { UsersSqlQueryRepository } from '../infrastructure/query/users-sql.query-repository';
import { SessionsSqlRepository } from '../infrastructure/sessions.sql-repository';
import { UserAccountsConfig } from '../user-accounts.config';

@Injectable()
export class SessionsService {
  constructor(
    //private usersQueryRepository: UsersQueryRepository,
    private usersSqlQueryRepository: UsersSqlQueryRepository,
    private jwtService: JwtService,
    private userAccountsConfig: UserAccountsConfig,
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
    private sessionsSqlRepository: SessionsSqlRepository,
  ) {}

  async validateRefreshToken(refreshToken: string) {
    await this.sessionsSqlRepository.isTokenRevoked(refreshToken);
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

  async accessTokenSign(userId: number, login?: string) {
    //const user = await this.usersQueryRepository.getByIdOrNotFoundFail(userId);
    const user = await this.usersSqlQueryRepository.getByIdOrNotFoundFail(userId);

    const accessToken = this.accessTokenContext.sign({
      userId: userId,
      login: login ? login : user.login,
    });

    return accessToken;
  }

  async refreshTokenSign(userId: number, deviceId: string) {
    const refreshToken = this.refreshTokenContext.sign({
      userId: userId,
      deviceId: deviceId,
    });
    return refreshToken;
  }
}
