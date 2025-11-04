import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain-exception';
import { AuthService } from '../../../../modules/user-accounts/application/auth.service';
import { UserContextDto } from '../../../../modules/user-accounts/dto/create-user.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'loginOrEmail' });
  }

  //validate возвращает то, что впоследствии будет записано в req.user
  async validate(loginOrEmail: string, password: string): Promise<UserContextDto> {
    const user = await this.authService.validateUser(loginOrEmail, password);
    console.log('user', user);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid username or password',
      });
    }

    return { id: user.id, login: user.login, email: user.email };
  }
}
