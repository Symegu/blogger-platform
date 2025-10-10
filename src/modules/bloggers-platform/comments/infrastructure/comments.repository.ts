import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';

import { Comment, CommentDocument, CommentModelType } from '../domain/comments.entity';

@Injectable()
export class CommentsRepository {
  constructor(@InjectModel(Comment.name) private CommentModel: CommentModelType) {}

  async findById(id: Types.ObjectId): Promise<CommentDocument | null> {
    return this.CommentModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async save(comment: CommentDocument) {
    await comment.save();
  }
  async findOrNotFoundFail(id: Types.ObjectId): Promise<CommentDocument> {
    const comment = await this.findById(id);
    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }

    return comment;
  }

  async updateLikeCounters(
    commentId: Types.ObjectId,
    likesCount: number,
    dislikesCount: number,
  ): Promise<void> {
    await this.CommentModel.updateOne(
      { _id: commentId, deletedAt: null },
      {
        $set: {
          'likesInfo.likesCount': likesCount,
          'likesInfo.dislikesCount': dislikesCount,
        },
      },
    );
  }
}
