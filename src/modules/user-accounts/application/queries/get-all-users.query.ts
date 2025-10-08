import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetUsersQueryParams } from '../../api/input-dto/users.input-dto';
import { UsersQueryRepository } from '../../infrastructure/query/users.query-repository';

export class GetAllUsersQuery {
  constructor(public queryParams: GetUsersQueryParams) {}
}

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersQueryHandler implements IQueryHandler<GetAllUsersQuery> {
  constructor(private usersQueryRepository: UsersQueryRepository) {}
  async execute(query: GetAllUsersQuery) {
    return this.usersQueryRepository.getAll(query.queryParams);
  }
}
