import { Injectable } from '@nestjs/common';

import { LikeStatus } from '../api/input-dto/like.input-dto';
import {
  ExtendedLikesInfoViewDto,
  LikeDetailsViewDto,
  LikesInfoViewDto,
} from '../api/view-dto/like.view-dto';
import { LikeableEntity } from '../domain/like.entity';
import { LikesSqlRepository } from '../infrastructure/likes-sql.repository';
import { LikesSqlQueryRepository } from '../infrastructure/query/likes-sql.query-repository';

@Injectable()
export class LikesService {
  constructor(
    private readonly likesSqlRepository: LikesSqlRepository,
    private readonly likesSqlQueryRepository: LikesSqlQueryRepository,
  ) {}

  async buildLikesInfo(
    entityId: number,
    entity: LikeableEntity,
    userId?: number | null,
  ): Promise<ExtendedLikesInfoViewDto | LikesInfoViewDto> {
    const [likesCount, dislikesCount, myStatus, newestLikes] = await Promise.all([
      this.likesSqlRepository.countByStatus(entityId, entity, 'Like'),
      this.likesSqlRepository.countByStatus(entityId, entity, 'Dislike'),
      this.calculateMyStatus(userId, entityId, entity),
      entity === 'Post' ? this.calculateNewestLikes(entityId, entity) : [],
    ]);

    if (entity === 'Post') {
      return {
        likesCount,
        dislikesCount,
        myStatus,
        newestLikes,
      } as ExtendedLikesInfoViewDto;
    }
    return { likesCount, dislikesCount, myStatus } as LikesInfoViewDto;
  }

  async attachLikesInfo<T extends { id: number }>(
    entities: T[],
    entity: LikeableEntity,
    userId?: number | null,
  ): Promise<(T & { likesInfo?: any; extendedLikesInfo?: any })[]> {
    return Promise.all(
      entities.map(async e => {
        const info = await this.buildLikesInfo(e.id, entity, userId);
        const key = entity === 'Post' ? 'extendedLikesInfo' : 'likesInfo';
        return { ...e, [key]: info };
      }),
    );
  }

  private async calculateMyStatus(
    userId: number | null | undefined,
    entityId: number,
    entity: LikeableEntity,
  ): Promise<LikeStatus> {
    if (!userId) {
      return LikeStatus.None;
    }
    const like = await this.likesSqlQueryRepository.calculateMyStatus(userId, entityId, entity);
    return like?.status ?? LikeStatus.None;
  }

  private async calculateNewestLikes(
    entityId: number,
    entity: LikeableEntity,
  ): Promise<LikeDetailsViewDto[]> {
    const newest = await this.likesSqlRepository.newestLikes(entityId, entity);
    return newest.map(l => ({
      addedAt: l.updated_at,
      userId: l.user_id.toString(),
      login: l.login,
    }));
  }

  async updateCounters(entityId: number, entity: LikeableEntity): Promise<void> {
    const likesCount = await this.likesSqlRepository.countByStatus(
      entityId,
      entity,
      LikeStatus.Like,
    );
    const dislikesCount = await this.likesSqlRepository.countByStatus(
      entityId,
      entity,
      LikeStatus.Dislike,
    );

    if (entity === 'Post') {
      await this.likesSqlRepository.applyPostLikeCounters(entityId, likesCount, dislikesCount);
    } else {
      await this.likesSqlRepository.applyCommentLikeCounters(entityId, likesCount, dislikesCount);
    }
  }
}
