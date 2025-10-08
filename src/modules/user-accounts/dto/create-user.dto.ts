import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { Types } from 'mongoose';

export class CreateUserDomainDto {
  login: string;
  email: string;
  passwordHash: string;
  confirmationCode?: string;
  confirmationCodeExpiration?: Date;
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
  id: Types.ObjectId;
  login: string;
  email: string;
}

export type Nullable<T> = { [P in keyof T]: T[P] | null };
