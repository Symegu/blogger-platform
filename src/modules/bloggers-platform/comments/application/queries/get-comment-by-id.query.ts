import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { LikeableEntity } from 'src/modules/likes/domain/like.entity';
import { LikesQueryRepository } from 'src/modules/likes/infrastructure/query/likes.query-repository';

import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import { CommentsQueryRepository } from '../../infrastructure/query/comments.query-repository';
import { LikesService } from '../../../../likes/application/likes.service';
import { UserContextDto } from 'src/modules/user-accounts/dto/create-user.dto';
import { CommentsRepository } from '../../infrastructure/comments.repository';

export class GetCommentByIdQuery {
  constructor(
    public readonly commentId: Types.ObjectId,
    public readonly user: UserContextDto | null,
  ) {}
}

@QueryHandler(GetCommentByIdQuery)
export class GetCommentByIdQueryHandler implements IQueryHandler<GetCommentByIdQuery> {
  constructor(
    private commentsRepository: CommentsRepository,
    private likesService: LikesService,
  ) {}

  async execute({ commentId, user }: GetCommentByIdQuery): Promise<CommentViewDto> {
    const comment = await this.commentsRepository.findOrNotFoundFail(commentId);

    const likesInfo = await this.likesService.buildLikesInfo(
      comment._id,
      LikeableEntity.Comment,
      user?.id,
    );
    comment.likesInfo = {
      likesCount: likesInfo.likesCount,
      dislikesCount: likesInfo.dislikesCount,
      myStatus: likesInfo.myStatus,
    };
    return CommentViewDto.mapToView(comment);
  }
}
