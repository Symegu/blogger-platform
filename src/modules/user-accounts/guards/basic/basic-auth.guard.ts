import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import {
  DomainException,
  DomainExceptionCode,
} from 'src/core/exceptions/domain-exception';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Missing or invalid Authorization header',
      });
    }

    // "Basic base64(username:password)"
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'utf-8',
    );
    const [username, password] = credentials.split(':');

    // сравнение с .env (или дефолтное admin:qwerty)
    const adminUsername = process.env.BASIC_AUTH_LOGIN || 'admin';
    const adminPassword = process.env.BASIC_AUTH_PASS || 'qwerty';

    if (username === adminUsername && password === adminPassword) {
      return true;
    }
    throw new DomainException({
      code: DomainExceptionCode.Unauthorized,
      message: 'Unauthorized',
    });
  }
}
