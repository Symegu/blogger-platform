import { UserDocument } from '../../domain/user.entity';

export class UserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
  // firstName: string;
  // lastName: string | null;

  static mapToView(user: UserDocument): UserViewDto {
    const dto = new UserViewDto();

    dto.email = user.email;
    dto.login = user.login;
    dto.id = user._id.toString();
    dto.createdAt = user.createdAt;
    // dto.firstName = user.name.firstName;
    // dto.lastName = user.name.lastName;

    return dto;
  }
}
