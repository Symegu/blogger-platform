import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { LikeableEntity } from 'src/modules/likes/domain/like.entity';
import { LikesQueryRepository } from 'src/modules/likes/infrastructure/query/likes.query-repository';

import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import { CommentsQueryRepository } from '../../infrastructure/query/comments.query-repository';

export class GetCommentByIdQuery {
  constructor(
    public readonly commentId: Types.ObjectId,
    public readonly userId?: Types.ObjectId,
  ) {}
}

@QueryHandler(GetCommentByIdQuery)
export class GetCommentByIdQueryHandler implements IQueryHandler<GetCommentByIdQuery> {
  constructor(
    private commentsQueryRepository: CommentsQueryRepository,
    private likesQueryRepository: LikesQueryRepository,
  ) {}

  async execute({ commentId, userId }: GetCommentByIdQuery): Promise<CommentViewDto> {
    const comment = await this.commentsQueryRepository.getByIdOrNotFoundFail(commentId);
    console.log('comment', comment);

    if (userId) {
      const status = await this.likesQueryRepository.calculateMyStatus(
        userId,
        commentId,
        LikeableEntity.Comment,
      );
      console.log('like status', status);

      comment.likesInfo.myStatus = status;
    }
    console.log('comment with like status', comment);

    return comment;
  }
}
