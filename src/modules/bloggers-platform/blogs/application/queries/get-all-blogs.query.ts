import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetBlogsQueryParams } from '../../api/input-dto/blogs.input-dto';
import { BlogsQueryRepository } from '../../infrastructure/query/blogs.query.repository';

export class GetAllBlogsQuery {
  constructor(public queryParams: GetBlogsQueryParams) {}
}

@QueryHandler(GetAllBlogsQuery)
export class GetAllBlogsQueryHandler implements IQueryHandler<GetAllBlogsQuery> {
  constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}

  async execute(query: GetAllBlogsQuery) {
    return this.blogsQueryRepository.getAll(query.queryParams);
  }
}
