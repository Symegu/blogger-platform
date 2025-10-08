import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ConfirmationInfoDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsString()
  @IsNotEmpty()
  confirmationCode: string;
  confirmationCodeExpiration: Date;
}

export class RecoveryInfoDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsString()
  @IsNotEmpty()
  recoveryCode: string;
  recoveryCodeExpiration: Date;
}

export class PasswordChangeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  newPassword: string;
  @IsString()
  @IsNotEmpty()
  recoveryCode: string;
}
