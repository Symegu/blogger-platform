import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain-exception';
import {
  ConfirmationInfoDto,
  RecoveryInfoDto,
} from '../../../../modules/notifications/dto/confirmation-info.dto';
import { MeViewDto } from '../../api/view-dto/me.view-dto';

@Injectable()
export class AuthSqlQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getMe(id: number): Promise<MeViewDto> {
    const users = await this.dataSource.query(
      `SELECT u.id, u.login, u.password_hash, u.email, u.is_email_confirmed, u.created_at, u.updated_at, u.deleted_at
           FROM public."Users" u
           WHERE u."id" = $1 AND u."deleted_at" IS NULL`,
      [id],
    );
    if (users.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }
    return MeViewDto.mapFromSql(users[0]);
  }

  async getConfirmationInfo(id: string): Promise<ConfirmationInfoDto> {
    const confirmationInfo = await this.dataSource.query(
      `SELECT u.email, ecc.confirmation_code, ecc.expiration_date
           FROM public."Users" u
           LEFT JOIN public."EmailConfirmationCodes" ecc ON u.id = ecc.user_id
           WHERE u."id" = $1 AND u."deleted_at" IS NULL AND ecc.is_active = true
           LIMIT 1`,
      [id],
    );
    if (confirmationInfo.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'confirmationInfo not found',
      });
    }
    return {
      email: confirmationInfo[0].email,
      confirmationCode: confirmationInfo[0].confirmation_code,
      confirmationCodeExpiration: confirmationInfo[0].expiration_date,
    };
  }

  async getUserByConfirmationCode(code: string): Promise<ConfirmationInfoDto> {
    const users = await this.dataSource.query(
      `SELECT u.email, ecc.confirmation_code, ecc.expiration_date
           FROM public."Users" u
           LEFT JOIN public."EmailConfirmationCodes" ecc ON u.id = ecc.user_id
           WHERE ecc.confirmation_code = $1 AND u."deleted_at" IS NULL AND ecc.is_active = true
           LIMIT 1`,
      [code],
    );

    if (users.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User not found',
        errorsMessages: [{ message: 'User not found', field: 'code' }],
      });
    }
    return {
      email: users[0].email,
      confirmationCode: users[0].confirmation_code,
      confirmationCodeExpiration: users[0].expiration_date,
    };
  }

  async getUserByRecoveryCode(code: string): Promise<RecoveryInfoDto> {
    const users = await this.dataSource.query(
      `SELECT u.email, prc.recovery_code, prc.expiration_date
           FROM public."Users" u
           LEFT JOIN public."PasswordRecoveryCodes" prc ON u.id = prc.user_id
           WHERE prc.recovery_code = $1 AND u."deleted_at" IS NULL AND prc.is_active = true
           LIMIT 1`,
      [code],
    );
    if (users.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User not found',
        errorsMessages: [{ message: 'User not found', field: 'code' }],
      });
    }
    return {
      email: users[0].email,
      recoveryCode: users[0].recovery_code,
      recoveryCodeExpiration: users[0].expiration_date,
    };
  }
}
