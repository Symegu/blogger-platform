import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';

import {
  Like,
  LikeModelType,
  LikeableEntity,
  LikeDocument,
  LikeStatus,
} from '../domain/like.entity';

@Injectable()
export class LikesRepository {
  constructor(
    @InjectModel(Like.name)
    private LikeModel: LikeModelType,
  ) {}

  async getLikeOrNotFoundFail(
    entityId: Types.ObjectId,
    entity: LikeableEntity,
  ): Promise<LikeDocument | null> {
    const like = this.LikeModel.findOne({ entityId, entity });
    if (!like) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }
    return like;
  }

  async findByUserAndEntity(
    userId: Types.ObjectId,
    entityId: Types.ObjectId,
    entity: LikeableEntity,
  ): Promise<LikeDocument | null> {
    return this.LikeModel.findOne({ userId, entityId, entity });
  }

  async save(like: LikeDocument): Promise<void> {
    await like.save();
  }

  async deleteAll(): Promise<void> {
    await this.LikeModel.deleteMany({});
  }

  async countByStatus(
    entityId: Types.ObjectId,
    entity: LikeableEntity,
    status: LikeStatus,
  ): Promise<number> {
    return this.LikeModel.countDocuments({ entityId, entity, status });
  }

  async newestLikes(entityId: Types.ObjectId, entity: LikeableEntity, limit = 3) {
    return this.LikeModel.find({ entityId, entity, status: LikeStatus.Like })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}
