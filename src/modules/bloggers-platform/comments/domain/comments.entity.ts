import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

import { CreateCommentDomainDto } from '../dto/create-comment.dto';

@Schema({ _id: false })
export class CommentatorInfo {
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  userLogin: string;
}
export const CommentatorInfoSchema = SchemaFactory.createForClass(CommentatorInfo);

@Schema({ _id: false })
export class CommentLikesInfo {
  @Prop({ type: Number, default: 0 })
  likesCount: number;

  @Prop({ type: Number, default: 0 })
  dislikesCount: number;
}
export const CommentLikesInfoSchema = SchemaFactory.createForClass(CommentLikesInfo);

@Schema({ timestamps: true, collection: 'comments' })
export class Comment {
  @Prop({ type: String, required: true, minlength: 20, maxlength: 300 })
  content: string;

  @Prop({ type: CommentatorInfo, required: true })
  commentatorInfo: CommentatorInfo;

  @Prop({ type: Types.ObjectId, required: true })
  postId: Types.ObjectId;

  @Prop({ type: CommentLikesInfo, default: () => ({}) })
  likesInfo: CommentLikesInfo;

  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  // Статический метод для создания инстанса
  static createInstance(dto: CreateCommentDomainDto): CommentDocument {
    const comment = new this();
    comment.content = dto.content;
    comment.commentatorInfo = {
      userId: dto.commentatorInfo.userId,
      userLogin: dto.commentatorInfo.userLogin,
    };
    comment.postId = dto.postId;
    comment.likesInfo = {
      likesCount: 0,
      dislikesCount: 0,
    };
    comment.createdAt = new Date();
    comment.updatedAt = new Date();

    return comment as CommentDocument;
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.loadClass(Comment);
export type CommentDocument = HydratedDocument<Comment>;
export type CommentModelType = Model<CommentDocument> & typeof Comment;
