import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { LikeableEntity, LikeStatus } from '../domain/like.entity';
import { LikesRepository } from '../infrastructure/likes.repository';

@Injectable()
export class LikesService {
  constructor(private readonly likesRepository: LikesRepository) {}

  // === PUBLIC METHODS ===

  /**
   * Формирует extendedLikesInfo / likesInfo для одной сущности
   */
  async buildLikesInfo(
    entityId: Types.ObjectId,
    entity: LikeableEntity,
    userId?: Types.ObjectId | null,
  ): Promise<{
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
    newestLikes: {
      addedAt: Date;
      userId: string;
      login: string;
    }[];
  }> {
    const [likesCount, dislikesCount, myStatus, newestLikes] = await Promise.all([
      this.likesRepository.countByStatus(entityId, entity, LikeStatus.Like),
      this.likesRepository.countByStatus(entityId, entity, LikeStatus.Dislike),
      this.calculateMyStatus(userId, entityId, entity),
      entity === LikeableEntity.Post ? this.calculateNewestLikes(entityId, entity) : [],
    ]);
    console.log('newestLikes', likesCount, dislikesCount, myStatus, newestLikes);

    return {
      likesCount,
      dislikesCount,
      myStatus,
      newestLikes,
    };
  }

  /**
   * Формирует likesInfo/extendedLikesInfo для массива сущностей
   */
  async attachLikesInfo<T extends { _id: Types.ObjectId }>(
    entities: T[],
    entity: LikeableEntity,
    userId?: Types.ObjectId | null,
  ): Promise<
    (T & {
      extendedLikesInfo?: any;
      likesInfo?: any;
    })[]
  > {
    return Promise.all(
      entities.map(async e => {
        const info = await this.buildLikesInfo(e._id, entity, userId);

        // Комментарии — likesInfo, посты — extendedLikesInfo
        const key = entity === LikeableEntity.Post ? 'extendedLikesInfo' : 'likesInfo';

        return {
          ...e,
          [key]: info,
        };
      }),
    );
  }

  // === PRIVATE METHODS ===

  private async calculateMyStatus(
    userId: Types.ObjectId | null | undefined,
    entityId: Types.ObjectId,
    entity: LikeableEntity,
  ): Promise<LikeStatus> {
    if (!userId) return LikeStatus.None;

    const like = await this.likesRepository.findByUserAndEntity(userId, entityId, entity);
    return like?.status ?? LikeStatus.None;
  }

  private async calculateNewestLikes(
    entityId: Types.ObjectId,
    entity: LikeableEntity,
  ): Promise<
    {
      addedAt: Date;
      userId: string;
      login: string;
    }[]
  > {
    const newest = await this.likesRepository.newestLikes(entityId, entity);
    return newest.map(l => ({
      addedAt: l.createdAt,
      userId: l.userId.toString(),
      login: l.userLogin,
    }));
  }
}
