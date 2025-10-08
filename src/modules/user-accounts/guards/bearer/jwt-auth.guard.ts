import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain-exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user) {
    if (err || !user) {
      // здесь можно выбросить любую свою ошибку
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }
    return user;
  }
}
