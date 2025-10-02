import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserContextDto } from 'src/modules/user-accounts/dto/create-user.dto';

export const ExtractUserIfExistsFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserContextDto => {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {
      throw new Error('there is no user in the request object!');
    }

    return user;
  },
);
