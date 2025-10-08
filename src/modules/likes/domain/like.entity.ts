import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

import { CreateLikeDomainDto } from '../dto/like.domain-dto';

export enum LikeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export enum LikeableEntity {
  Post = 'Post',
  Comment = 'Comment',
}

@Schema({ timestamps: true, collection: 'likes' })
export class Like {
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: LikeableEntity,
  })
  entity: LikeableEntity; // 'Post' или 'Comment'

  @Prop({ type: Types.ObjectId, required: true })
  entityId: Types.ObjectId; // ID поста или комментария

  @Prop({
    type: String,
    required: true,
    enum: LikeStatus,
    default: LikeStatus.None,
  })
  status: LikeStatus;

  createdAt: Date;
  updatedAt: Date;

  // Статический метод для создания инстанса
  static createInstance(dto: CreateLikeDomainDto): LikeDocument {
    const like = new this();
    like.userId = dto.userId;
    like.entity = dto.entity;
    like.entityId = dto.entityId;
    like.status = dto.status;
    like.createdAt = new Date();
    like.updatedAt = new Date();

    return like as LikeDocument;
  }

  // Метод для обновления статуса
  updateStatus(newStatus: LikeStatus): void {
    this.status = newStatus;
    this.updatedAt = new Date();
  }
}

export const LikeSchema = SchemaFactory.createForClass(Like);
LikeSchema.loadClass(Like);
export type LikeDocument = HydratedDocument<Like>;
export type LikeModelType = Model<LikeDocument> & typeof Like;
