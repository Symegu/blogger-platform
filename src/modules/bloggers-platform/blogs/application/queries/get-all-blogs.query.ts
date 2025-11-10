import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetBlogsQueryParams } from '../../api/input-dto/blogs.input-dto';
import { BlogsSqlQueryRepository } from '../../infrastructure/query/blogs-sql.query-repository';

export class GetAllBlogsQuery {
  constructor(public queryParams: GetBlogsQueryParams) {}
}

@QueryHandler(GetAllBlogsQuery)
export class GetAllBlogsQueryHandler implements IQueryHandler<GetAllBlogsQuery> {
  constructor(private readonly blogsSqlQueryRepository: BlogsSqlQueryRepository) {}

  async execute({ queryParams }: GetAllBlogsQuery) {
    console.log('GetAllBlogsQueryHandler', queryParams);

    return this.blogsSqlQueryRepository.getAll(queryParams);
  }
}
