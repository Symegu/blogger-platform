import { IsNotEmpty, IsString, MinLength } from 'class-validator';
// import { IsLoginOrEmail } from '../validators/is-login-or-email.validator';

export class LoginInputDto {
  @IsString()
  @IsNotEmpty()
  loginOrEmail: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
