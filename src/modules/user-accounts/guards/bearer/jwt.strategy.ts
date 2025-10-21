import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Types } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserContextDto } from '../../dto/create-user.dto';
import { UserAccountsConfig } from '../../user-accounts.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(userAccountsConfig: UserAccountsConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: userAccountsConfig.accessTokenSecret,
    });
  }

  /**
   * функция принимает payload из jwt токена и возвращает то, что впоследствии будет записано в req.user
   * @param payload
   */
  async validate(payload: {
    userId: string;
    login: string;
    email: string;
  }): Promise<UserContextDto> {
    return {
      id: new Types.ObjectId(payload.userId),
      login: payload.login,
      email: payload.email || '',
    };
  }
}
