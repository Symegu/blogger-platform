import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetPostsQueryParams } from '../../api/input-dto/posts.input-dto';
import { PostsQueryRepository } from '../../infrastructure/query/posts.query-repository';
import { UserContextDto } from 'src/modules/user-accounts/dto/create-user.dto';
import { LikesService } from 'src/modules/likes/application/likes.service';
import { LikeableEntity } from 'src/modules/likes/domain/like.entity';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class GetAllPostsQuery {
  constructor(
    public queryParams: GetPostsQueryParams,
    public user: UserContextDto | null,
  ) {}
}

@QueryHandler(GetAllPostsQuery)
export class GetAllPostsQueryHandler implements IQueryHandler<GetAllPostsQuery> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private likesService: LikesService,
  ) {}
  async execute({ queryParams, user }: GetAllPostsQuery) {
    const paginated = await this.postsRepository.getAll(queryParams);

    // приклеиваем лайки только к items
    const itemsWithLikes = await this.likesService.attachLikesInfo(
      paginated.items,
      LikeableEntity.Post,
      user?.id,
    );

    // мапим каждый элемент в PostViewDto (mapToView должен работать с plain object)
    const mapped = itemsWithLikes.map(p => PostViewDto.mapToView(p));

    return {
      ...paginated,
      items: mapped,
    } as PaginatedViewDto<PostViewDto[]>;
  }
}
