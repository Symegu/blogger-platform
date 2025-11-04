import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { DomainException, DomainExceptionCode } from '../../../core/exceptions/domain-exception';
import {
  ConfirmationInfoDto,
  RecoveryInfoDto,
} from '../../../modules/notifications/dto/confirmation-info.dto';

@Injectable()
export class AuthSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async confirmUserEmail(email: string) {
    const users = await this.dataSource.query(
      `SELECT u.id, u.is_email_confirmed, ecc.confirmation_code, ecc.expiration_date
       FROM public."Users" u
       LEFT JOIN public."EmailConfirmationCodes" ecc ON u.id = ecc.user_id
       WHERE u.email = $1 AND u.deleted_at IS NULL AND ecc.is_active = true
       LIMIT 1`,
      [email],
    );
    console.log(users);

    if (users.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'NotFound',
        errorsMessages: [{ message: 'User not found', field: 'email' }],
      });
    }

    if (users[0].is_email_confirmed !== false) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email already confirmed',
        errorsMessages: [{ message: 'Email already confirmed', field: 'email' }],
      });
    }

    if (users[0].expiration_date.getTime() < Date.now()) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Code expired',
        errorsMessages: [{ message: 'Code expired', field: 'confirmationCodeExpiration' }],
      });
    }

    await this.dataSource.query(
      `UPDATE public."Users" SET is_email_confirmed = true WHERE id = $1`,
      [users[0].id],
    );
    await this.dataSource.query(
      `UPDATE public."EmailConfirmationCodes" SET is_active = false WHERE confirmation_code = $1`,
      [users[0].confirmation_code],
    );
    console.log('confirmUserEmail', users[0]);
    return users[0];
  }

  async setUserConfirmation(confirmationInfo: ConfirmationInfoDto) {
    const users = await this.dataSource.query(
      `SELECT u.id, u.is_email_confirmed
      FROM public."Users" u
        WHERE u.email = $1 AND u."deleted_at" IS NULL`,
      [confirmationInfo.email],
    );

    if (users.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User not found with this email',
        errorsMessages: [{ message: 'User not found', field: 'email' }],
      });
    }

    if (users[0].is_email_confirmed !== false) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email already confirmed',
        errorsMessages: [{ message: 'Email already confirmed2', field: 'email' }],
      });
    }

    await this.dataSource.query(
      `UPDATE public."EmailConfirmationCodes" 
        SET is_active = false
        WHERE user_id = $1 AND is_active = true`,
      [users[0].id],
    );
    await this.dataSource.query(
      `INSERT INTO public."EmailConfirmationCodes" 
        (user_id, confirmation_code, expiration_date)
        VALUES ($1, $2, $3)`,
      [users[0].id, confirmationInfo.confirmationCode, confirmationInfo.confirmationCodeExpiration],
    );
    return users[0];
  }

  async setUserRecovery(recoveryInfo: RecoveryInfoDto) {
    const users = await this.dataSource.query(
      `SELECT u.id, u.is_email_confirmed
      FROM public."Users" u
        WHERE u.email = $1 AND u."deleted_at" IS NULL`,
      [recoveryInfo.email],
    );

    if (users.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'NotFound',
        errorsMessages: [{ message: 'User not found', field: 'email' }],
      });
    }

    if (users[0].isEmailConfirmed !== false) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email already confirmed',
        errorsMessages: [{ message: 'Email already confirmed', field: 'email' }],
      });
    }
    await this.dataSource.query(
      `UPDATE public."PasswordRecoveryCodes" 
        SET is_active = false
        WHERE user_id = $1 AND is_active = true`,
      [users[0].id],
    );
    await this.dataSource.query(
      `INSERT INTO public."PasswordRecoveryCodes" 
       (user_id, recovery_code, expiration_date)
       VALUES ($1, $2, $3)`,
      [users[0].id, recoveryInfo.recoveryCode, recoveryInfo.recoveryCodeExpiration],
    );
    return users[0];
  }

  async setNewUserPassword(email: string, hashPassword: string) {
    const users = await this.dataSource.query(
      `SELECT u.id, u.login, u.password_hash, u.email, u.is_email_confirmed, u.created_at, u.updated_at, u.deleted_at
           FROM public."Users" u
           WHERE u.email = $1 AND u."deleted_at" IS NULL`,
      [email],
    );
    if (users.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'NotFound',
        errorsMessages: [{ message: 'User not found', field: 'email' }],
      });
    }
    await this.dataSource.query(`UPDATE public."Users" SET password_hash = $1 WHERE id = $2`, [
      hashPassword,
      users[0].id,
    ]);
    return users[0];
  }
}
