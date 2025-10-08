import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';

import { PostsQueryRepository } from '../../infrastructure/query/posts.query-repository';

export class GetPostByIdQuery {
  constructor(public id: Types.ObjectId) {}
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler implements IQueryHandler<GetPostByIdQuery> {
  constructor(private readonly postsQueryRepository: PostsQueryRepository) {}
  async execute(query: GetPostByIdQuery) {
    return this.postsQueryRepository.getByIdOrNotFoundFail(query.id);
  }
}
