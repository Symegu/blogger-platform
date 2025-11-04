import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';
import { DataSource } from 'typeorm';

import { RefreshTokenPayloadDto } from '../dto/payload.dto';

@Injectable()
export class SessionsSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createSession(data) {
    const result = await this.dataSource.query(
      `INSERT INTO public."Sessions" 
       (user_id, device_id, title, ip, expires_at, last_active_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [data.userId, data.deviceId, data.title, data.ip, data.expiresAt, data.lastActiveDate],
    );

    return result[0];
  }

  async updateSession(data) {
    const sessions = await this.dataSource.query(
      `SELECT *
       FROM public."Sessions" s
       WHERE s.user_id = $1 AND s.device_id = $2 AND s.deleted_at IS NULL
      `,
      [data.userId, data.deviceId],
    );
    await this.dataSource.query(
      `UPDATE public."Sessions"
      SET last_active_date = $1, expires_at = $2, ip = $3, title = $4
      WHERE id = $5`,
      [data.lastActiveDate, data.expiresAt, data.ip, 'updated', sessions[0].id],
    );
    return;
  }

  // async deleteByDeviceId(userId: number, deviceId: string) {
  //   const result = await this.dataSource.query(
  //     `UPDATE public."Sessions"
  //      SET deleted_at = CURRENT_TIMESTAMP
  //      WHERE user_id = $1 AND device_id = $2 AND deleted_at IS NULL`,
  //     [userId, deviceId],
  //   );

  //   if (result.rowCount === 0) {
  //     throw new DomainException({
  //       code: DomainExceptionCode.NotFound,
  //       message: 'Session not found',
  //     });
  //   }
  //   return;
  // }

  async deleteAllOtherDevices(userId: number, deviceId: string) {
    console.log(userId, deviceId);

    await this.dataSource.query(
      `UPDATE public."Sessions" 
       SET deleted_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1 AND device_id != $2 AND deleted_at IS NULL`,
      [userId, deviceId],
    );
    return;
  }

  async findByTokenPayloadOrFail(payload: RefreshTokenPayloadDto) {
    const sessions = await this.dataSource.query(
      `SELECT s.id, s.user_id, s.device_id, s.title, s.ip, s.expires_at, s.last_active_date
        FROM public."Sessions" s
       WHERE s.user_id = $1 AND s.device_id = $2 AND s.deleted_at IS NULL`,
      [payload.userId, payload.deviceId],
    );

    if (sessions.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Session not found',
      });
    }
    return sessions[0];
  }

  async invalidateToken(token: string): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO public."RevokedTokens" 
       (token, revoked_at)
       VALUES ($1, $2)`,
      [token, new Date()],
    );
  }

  async invalidateSession(userId: number, deviceId: string): Promise<void> {
    console.log('invalidateSession', userId, deviceId);

    await this.dataSource.query(
      `UPDATE public."Sessions"
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND device_id = $2`,
      [userId, deviceId],
    );
  }

  async isTokenRevoked(token: string): Promise<void> {
    const results = await this.dataSource.query(
      `SELECT * 
      FROM public."RevokedTokens" 
       WHERE token = $1`,
      [token],
    );

    if (results.length !== 0) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Token was revoked',
      });
    }
    return;
  }
}
