import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateUserDomainDto {
  login: string;
  email: string;
  passwordHash: string;
  confirmationCode?: string;
  confirmationCodeExpiration?: Date;
}

export class CreateUserData {
  login: string;
  email: string;
  passwordHash: string;
}

export class CreateUserNameData {
  firstName: string = 'firstName';
  lastName: string = 'lastName';
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  login: string;
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UpdateUserDto {
  email: string;
}

export class UserContextDto {
  id: number;
  login: string;
  email: string;
}

export type Nullable<T> = { [P in keyof T]: T[P] | null };
