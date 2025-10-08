import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetPostsQueryParams } from '../../api/input-dto/posts.input-dto';
import { PostsQueryRepository } from '../../infrastructure/query/posts.query-repository';

export class GetAllPostsQuery {
  constructor(public queryParams: GetPostsQueryParams) {}
}

@QueryHandler(GetAllPostsQuery)
export class GetAllPostsQueryHandler implements IQueryHandler<GetAllPostsQuery> {
  constructor(private readonly postsQueryRepository: PostsQueryRepository) {}
  async execute(query: GetAllPostsQuery) {
    return this.postsQueryRepository.getAll(query.queryParams);
  }
}
