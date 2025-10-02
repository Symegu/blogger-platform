import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }
  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ) {
    //super.handleRequest(err, user, info, context, status);
    // мы не будем вызывать здесь базовый метод суперкласса, в нём написано вот это:
    // кидаем ошибку если нет юзера или если другая ошибка (например JWT протух)...
    // handleRequest(err, user, info, context, status) {
    //   if (err || !user) {
    //     throw err || new common_1.UnauthorizedException();
    //   }
    //   return user;
    // }
    // а мы вернём просто null и не будем процессить ошибку и null
    if (err || !user) {
      return null;
    } else {
      return user;
    }
  }
}
