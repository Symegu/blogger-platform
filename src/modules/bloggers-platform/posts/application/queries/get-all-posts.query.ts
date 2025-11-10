import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { LikesService } from 'src/modules/likes/application/likes.service';
import { UserContextDto } from 'src/modules/user-accounts/dto/create-user.dto';

import { GetPostsQueryParams } from '../../api/input-dto/posts.input-dto';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { PostsSqlQueryRepository } from '../../infrastructure/query/posts-sql.query-repository';

export class GetAllPostsQuery {
  constructor(
    public queryParams: GetPostsQueryParams,
    public user: UserContextDto | null,
  ) {}
}

@QueryHandler(GetAllPostsQuery)
export class GetAllPostsQueryHandler implements IQueryHandler<GetAllPostsQuery> {
  constructor(
    private readonly postsSqlQueryRepository: PostsSqlQueryRepository,
    private likesService: LikesService,
  ) {}
  async execute({ queryParams, user }: GetAllPostsQuery) {
    console.log('execute', queryParams, user);
    const posts = await this.postsSqlQueryRepository.getAll(queryParams);
    console.log('execute', posts);

    const itemsWithLikes = await this.likesService.attachLikesInfo(posts.items, 'Post', user?.id);
    console.log('executeitemsWithLikes', itemsWithLikes);

    const mapped = itemsWithLikes.map(p =>
      PostViewDto.mapFromSql({
        ...p,
        extendedLikesInfo: p.extendedLikesInfo,
      }),
    );
    console.log('mapped', mapped);

    return {
      ...posts,
      items: mapped,
    } as PaginatedViewDto<PostViewDto[]>;
  }
}
