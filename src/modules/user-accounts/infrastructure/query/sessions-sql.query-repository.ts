import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { SessionViewDto } from '../../api/view-dto/session.view-dto';
import { SessionData } from '../../domain/session.entity';

@Injectable()
export class SessionsSqlQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findByDeviceId(deviceId: string): Promise<SessionViewDto | null> {
    const sessions = await this.dataSource.query(
      `SELECT s.id, s.user_id, s.device_id, s.title, s.ip, s.expires_at, s.last_active_date, s.created_at
           FROM public."Sessions" s
           WHERE s.device_id = $1 AND s.deleted_at IS NULL`,
      [deviceId],
    );
    return SessionViewDto.mapFromSql(sessions[0]);
  }

  async findDataByDeviceId(deviceId: string): Promise<SessionData | null> {
    const sessions = await this.dataSource.query(
      `SELECT s.id, s.user_id, s.device_id, s.title, s.ip, s.expires_at, s.last_active_date, s.created_at
           FROM public."Sessions" s
           WHERE s.device_id = $1 AND s.deleted_at IS NULL`,
      [deviceId],
    );
    return sessions[0];
  }

  async findByUserId(userId: number): Promise<SessionViewDto[]> {
    const sessions = await this.dataSource.query(
      `SELECT s.id, s.user_id, s.device_id, s.title, s.ip, s.expires_at, s.last_active_date, s.created_at
           FROM public."Sessions" s
           WHERE s.user_id = $1 AND s.deleted_at IS NULL`,
      [userId],
    );
    return sessions.map(session => SessionViewDto.mapFromSql(session));
  }
}
