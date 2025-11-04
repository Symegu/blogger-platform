export interface EmailConfirmationCodeData {
  id: number;
  user_id: number;
  confirmation_code: string;
  expiration_date: Date;
}

export interface PasswordRecoveryCodeData {
  id: number;
  user_id: number;
  recovery_code: string;
  expiration_date: Date;
}
