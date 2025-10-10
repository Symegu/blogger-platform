import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { UserContextDto } from 'src/modules/user-accounts/dto/create-user.dto';

import { GetCommentsQueryParams } from '../../api/input-dto/comment.input-dto';
import { CommentsQueryRepository } from '../../infrastructure/query/comments.query-repository';
import { LikesService } from 'src/modules/likes/application/likes.service';
import { LikeableEntity } from 'src/modules/likes/domain/like.entity';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';

export class GetAllCommentsQuery {
  constructor(
    public queryParams: GetCommentsQueryParams,
    public postId: Types.ObjectId,
    public user: UserContextDto,
  ) {}
}

@QueryHandler(GetAllCommentsQuery)
export class GetAllCommentsQueryHandler implements IQueryHandler<GetAllCommentsQuery> {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly likesService: LikesService,
  ) {}
  async execute({ queryParams, postId, user }: GetAllCommentsQuery) {
    const paginated = await this.commentsQueryRepository.getAll(queryParams, postId);

    const itemsWithLikes = await this.likesService.attachLikesInfo(
      paginated.items.map(i => ({ _id: new Types.ObjectId(i.id), ...i })),
      LikeableEntity.Comment,
      user?.id,
    );

    const mapped = itemsWithLikes.map(c => CommentViewDto.mapToView(c as any));

    return {
      ...paginated,
      items: mapped,
    };
  }
}
