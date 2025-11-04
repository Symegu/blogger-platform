import { OmitType } from '@nestjs/swagger';

import { UserViewDto } from './users.view-dto';
import { UserData } from '../../domain/user.entity';

export class MeViewDto extends OmitType(UserViewDto, ['createdAt', 'id'] as const) {
  userId: string;
  login: string;
  email: string;

  // static mapToView(user: UserDocument): MeViewDto {
  //   const dto = new MeViewDto();

  //   dto.email = user.email;
  //   dto.login = user.login;
  //   dto.userId = user._id.toString();

  //   return dto;
  // }

  static mapFromSql(user: UserData): MeViewDto {
    const dto = new MeViewDto();

    dto.login = user.login;
    dto.email = user.email;
    dto.userId = user.id.toString();

    return dto;
  }
}
