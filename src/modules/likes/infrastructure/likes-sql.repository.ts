import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { LikeDetailsViewDto } from '../api/view-dto/like.view-dto';
import { LikeableEntity, LikeStatus } from '../domain/like.entity';

@Injectable()
export class LikesSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async create(userId: number, entityId: number, entity: LikeableEntity, status: LikeStatus) {
    console.log('setlike repo ', userId, entityId, entity.toString(), status.toString());

    const result = await this.dataSource.query(
      `INSERT INTO public."Likes"
      (user_id, entity_id, entity_type, status, updated_at)
      VALUES ($1,$2,$3,$4, CURRENT_TIMESTAMP)`,
      [userId, entityId, entity.toString(), status.toString()],
    );
    console.log('setlike repo result', result);

    return result;
  }

  async update(userId: number, entityId: number, entity: LikeableEntity, status: LikeStatus) {
    console.log('Updated like repo ', userId, entityId, entity.toString(), status.toString());

    const result = await this.dataSource.query(
      `UPDATE public."Likes" 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2 AND entity_id = $3 AND entity_type = $4`,
      [status.toString(), userId, entityId, entity.toString()],
    );
    console.log('Updated like result:', result);
    return result;
  }

  async findByUserAndEntity(userId: number, entityId: number, entity: LikeableEntity) {
    console.log('findByUserAndEntity', userId, entityId, entity.toString());

    const result = await this.dataSource.query(
      `SELECT l.id, l.user_id, l.entity_id, l.entity_type, l.status
      FROM public."Likes" l
      WHERE l.user_id = $1 AND l.entity_id = $2 AND l.entity_type = $3`,
      [userId, entityId, entity.toString()],
    );
    console.log('findByUserAndEntity result', result);
    return result;
  }

  async countByStatus(entityId: number, entity: LikeableEntity, status: LikeStatus) {
    console.log('countByStatus', entityId, entity.toString(), status.toString());

    const result = await this.dataSource.query(
      `SELECT COUNT(*)::int AS cnt
      FROM public."Likes" l
      WHERE l.entity_id = $1 AND l.status = $3 AND l.entity_type = $2`,
      [entityId, entity.toString(), status.toString()],
    );
    console.log('countByStatus result1', result[0]?.cnt);

    return result[0]?.cnt;
  }

  async newestLikes(entityId: number, entity: LikeableEntity) {
    const result = await this.dataSource.query(
      `SELECT l.user_id, u.login, l.updated_at
      FROM public."Likes" l 
      LEFT JOIN public."Users" u ON l.user_id = u.id
      WHERE l.entity_id = $1 AND l.status = $3 AND l.entity_type = $2
      ORDER BY l.updated_at DESC
      LIMIT 3`,
      [entityId, entity.toString(), 'Like'],
    );
    console.log('newestLikes result', result);

    return result;
  }

  async applyPostLikeCounters(postId: number, likes: number, dislikes: number) {
    await this.dataSource.query(
      `
    UPDATE public."Posts"
    SET likes_count = $2,
        dislikes_count = $3,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `,
      [postId, likes, dislikes],
    );
  }

  async applyCommentLikeCounters(commentId: number, likes: number, dislikes: number) {
    await this.dataSource.query(
      `
    UPDATE public."Comments"
    SET likes_count = $2,
        dislikes_count = $3,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `,
      [commentId, likes, dislikes],
    );
  }
}
