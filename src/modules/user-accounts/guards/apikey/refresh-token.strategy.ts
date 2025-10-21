import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Types } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserAccountsConfig } from '../../user-accounts.config';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(userAccountsConfig: UserAccountsConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          console.log('cookie', req.cookies);

          if (req.cookies && req.cookies.refreshToken) {
            return req.cookies.refreshToken;
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: userAccountsConfig.refreshTokenSecret,
    });
  }
  async validate(payload: {
    id: string;
    deviceId: string;
  }): Promise<{ id: Types.ObjectId; deviceId: Types.ObjectId }> {
    return {
      id: new Types.ObjectId(payload.id),
      deviceId: new Types.ObjectId(payload.deviceId),
    };
  }
}
