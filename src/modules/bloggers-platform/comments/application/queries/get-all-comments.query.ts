import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
//import { UserContextDto } from 'src/modules/user-accounts/dto/create-user.dto';

import { GetCommentsQueryParams } from '../../api/input-dto/comment.input-dto';
import { CommentsQueryRepository } from '../../infrastructure/query/comments.query-repository';

export class GetAllCommentsQuery {
  constructor(
    public queryParams: GetCommentsQueryParams,
    public postId: Types.ObjectId,
    //public user: UserContextDto,
  ) {}
}

@QueryHandler(GetAllCommentsQuery)
export class GetAllCommentsQueryHandler implements IQueryHandler<GetAllCommentsQuery> {
  constructor(private readonly commentsQueryRepository: CommentsQueryRepository) {}
  async execute({ queryParams, postId }: GetAllCommentsQuery) {
    return this.commentsQueryRepository.getAll(queryParams, postId);
  }
}
