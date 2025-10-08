import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserContextDto } from 'src/modules/user-accounts/dto/create-user.dto';

export const ExtractUserFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserContextDto | null => {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {
      return null;
    }

    return user;
  },
);
