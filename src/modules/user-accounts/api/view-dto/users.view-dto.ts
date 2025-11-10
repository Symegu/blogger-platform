import { UserData } from '../../domain/user.entity';

export class UserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: Date;

  static mapFromSql(user: UserData): UserViewDto {
    const dto = new UserViewDto();

    dto.id = user.id.toString();
    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.created_at;

    return dto;
  }
}
