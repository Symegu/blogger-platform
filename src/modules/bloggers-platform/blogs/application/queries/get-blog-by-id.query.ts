import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';

import { BlogsQueryRepository } from '../../infrastructure/query/blogs.query.repository';

export class GetBlogByIdQuery {
  constructor(public id: Types.ObjectId) {}
}

@QueryHandler(GetBlogByIdQuery)
export class GetBlogByIdQueryHandler implements IQueryHandler<GetBlogByIdQuery> {
  constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}
  async execute(query: GetBlogByIdQuery) {
    return this.blogsQueryRepository.getByIdOrNotFoundFail(query.id);
  }
}
