import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { LikesService } from 'src/modules/likes/application/likes.service';
import { UserContextDto } from 'src/modules/user-accounts/dto/create-user.dto';

import { GetCommentsQueryParams } from '../../api/input-dto/comment.input-dto';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import { CommentsSqlQueryRepository } from '../../infrastructure/query/comments-sql.query-repository';

export class GetAllCommentsQuery {
  constructor(
    public queryParams: GetCommentsQueryParams,
    public postId: number,
    public user: UserContextDto,
  ) {}
}

@QueryHandler(GetAllCommentsQuery)
export class GetAllCommentsQueryHandler implements IQueryHandler<GetAllCommentsQuery> {
  constructor(
    private readonly commentsSqlQueryRepository: CommentsSqlQueryRepository,
    private readonly likesService: LikesService,
  ) {}
  async execute({ queryParams, postId, user }: GetAllCommentsQuery) {
    console.log('execute', queryParams, user);
    const comments = await this.commentsSqlQueryRepository.getAll(queryParams, postId);
    console.log('execute', comments);
    const itemsWithLikes = await this.likesService.attachLikesInfo(
      comments.items,
      'Comment',
      user?.id,
    );
    console.log('executeitemsWithLikes', itemsWithLikes);

    const mapped = itemsWithLikes.map(c =>
      CommentViewDto.mapFromSql({
        ...c,
        likesInfo: c.likesInfo,
      }),
    );
    console.log('mapped', mapped);

    return {
      ...comments,
      items: mapped,
    } as PaginatedViewDto<CommentViewDto[]>;
  }
}
