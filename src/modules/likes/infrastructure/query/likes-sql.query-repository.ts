import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { LikeableEntity } from '../../domain/like.entity';

@Injectable()
export class LikesSqlQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async calculateMyStatus(userId: number | null, entityId: number, entity: LikeableEntity) {
    const status = await this.dataSource.query(
      `SELECT status
        FROM public."Likes"
        WHERE entity_type = $3 AND user_id = $1 AND entity_id = $2`,
      [userId, entityId, entity.toString()],
    );
    console.log('calculateMyStatus', status);

    if (status.length === 0) return 'None';
    return status[0];
  }

  async calculateMyStatuses(userId: number | null, entityId: number[], entity: LikeableEntity) {
    if (entityId.length === 0) return [];

    const statuses = await this.dataSource.query(
      `SELECT entity_id, status
        FROM public."Likes"
        WHERE entity_type = $3 AND user_id = $1 AND entity_id = ANY($2::int[])`,
      [userId, entityId, entity.toString()],
    );

    console.log('calculateMyStatus', statuses);
    return statuses;
  }
}
