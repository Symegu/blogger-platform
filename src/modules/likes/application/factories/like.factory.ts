import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import {
  Like,
  LikeDocument,
  LikeModelType,
  LikeStatus,
  LikeableEntity,
} from '../../domain/like.entity';
import { CreateLikeDomainDto } from '../../dto/like.domain-dto';

@Injectable()
export class LikesFactory {
  constructor(
    @InjectModel(Like.name)
    private LikeModel: LikeModelType,
  ) {}

  async create(dto: CreateLikeDomainDto): Promise<LikeDocument> {
    const like = this.LikeModel.createInstance(dto);
    return like;
  }

  createForPost(
    userId: Types.ObjectId,
    userLogin: string,
    postId: Types.ObjectId,
    status: LikeStatus,
  ): Promise<LikeDocument> {
    return this.create({
      userId,
      userLogin,
      entity: LikeableEntity.Post,
      entityId: postId,
      status,
    });
  }

  createForComment(
    userId: Types.ObjectId,
    userLogin: string,
    commentId: Types.ObjectId,
    status: LikeStatus,
  ): Promise<LikeDocument> {
    return this.create({
      userId,
      userLogin,
      entity: LikeableEntity.Comment,
      entityId: commentId,
      status,
    });
  }
}
