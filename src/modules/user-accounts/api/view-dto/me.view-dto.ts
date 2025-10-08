import { OmitType } from '@nestjs/swagger';

import { UserViewDto } from './users.view-dto';
import { UserDocument } from '../../domain/user.entity';

export class MeViewDto extends OmitType(UserViewDto, ['createdAt', 'id'] as const) {
  userId: string;

  static mapToView(user: UserDocument): MeViewDto {
    const dto = new MeViewDto();

    dto.email = user.email;
    dto.login = user.login;
    dto.userId = user._id.toString();

    return dto;
  }
}
