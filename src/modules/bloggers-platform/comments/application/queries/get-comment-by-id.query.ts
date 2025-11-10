import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LikesInfoViewDto } from 'src/modules/likes/api/view-dto/like.view-dto';
import { UserContextDto } from 'src/modules/user-accounts/dto/create-user.dto';

import { LikesService } from '../../../../likes/application/likes.service';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import { CommentsSqlRepository } from '../../infrastructure/comments-sql.repository';

export class GetCommentByIdQuery {
  constructor(
    public readonly commentId: number,
    public readonly user: UserContextDto | null,
  ) {}
}

@QueryHandler(GetCommentByIdQuery)
export class GetCommentByIdQueryHandler implements IQueryHandler<GetCommentByIdQuery> {
  constructor(
    private commentsSqlRepository: CommentsSqlRepository,
    private likesService: LikesService,
  ) {}

  async execute({ commentId, user }: GetCommentByIdQuery): Promise<CommentViewDto> {
    const comment = await this.commentsSqlRepository.findOrNotFoundFail(commentId);

    const likesInfo = (await this.likesService.buildLikesInfo(
      commentId,
      'Comment',
      user?.id,
    )) as LikesInfoViewDto;

    return CommentViewDto.mapFromSql({
      ...comment,
      likesInfo,
    });
  }
}
