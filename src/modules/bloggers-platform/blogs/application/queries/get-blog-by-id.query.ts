import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { BlogsSqlQueryRepository } from '../../infrastructure/query/blogs-sql.query-repository';

export class GetBlogByIdQuery {
  constructor(public id: number) {}
}

@QueryHandler(GetBlogByIdQuery)
export class GetBlogByIdQueryHandler implements IQueryHandler<GetBlogByIdQuery> {
  constructor(private readonly blogsSqlQueryRepository: BlogsSqlQueryRepository) {}
  async execute(query: GetBlogByIdQuery) {
    return this.blogsSqlQueryRepository.getByIdOrNotFoundFail(query.id);
  }
}
