import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty } from 'class-validator';
import { configValidationUtility } from 'src/core/core.config';

@Injectable()
export class UserAccountsConfig {
  @IsNotEmpty({
    message: 'Set Env variable ACCESS_TOKEN_EXPIRE_IN, examples: 1h, 5m, 2d',
  })
  accessTokenExpireIn: string = this.configService.get('ACCESS_TOKEN_EXPIRE_IN');

  @IsNotEmpty({
    message: 'Set Env variable REFRESH_TOKEN_EXPIRE_IN, examples: 1h, 5m, 2d',
  })
  refreshTokenExpireIn: string = this.configService.get('REFRESH_TOKEN_EXPIRE_IN');

  @IsNotEmpty({
    message: 'Set Env variable REFRESH_TOKEN_SECRET, dangerous for security!',
  })
  refreshTokenSecret: string = this.configService.get('REFRESH_TOKEN_SECRET');

  @IsNotEmpty({
    message: 'Set Env variable ACCESS_TOKEN_SECRET, dangerous for security!',
  })
  accessTokenSecret: string = this.configService.get('ACCESS_TOKEN_SECRET');

  constructor(private configService: ConfigService<any, true>) {
    configValidationUtility.validateConfig(this);
  }
}
