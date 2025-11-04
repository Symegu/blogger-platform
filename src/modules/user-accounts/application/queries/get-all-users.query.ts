import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetUsersQueryParams } from '../../api/input-dto/users.input-dto';
//import { UsersQueryRepository } from '../../infrastructure/query/users.query-repository';
import { UsersSqlQueryRepository } from '../../infrastructure/query/users-sql.query-repository';

export class GetAllUsersQuery {
  constructor(public queryParams: GetUsersQueryParams) {}
}

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersQueryHandler implements IQueryHandler<GetAllUsersQuery> {
  constructor(
    //private usersQueryRepository: UsersQueryRepository,
    private readonly usersSqlQueryRepository: UsersSqlQueryRepository,
  ) {}
  async execute({ queryParams }: GetAllUsersQuery) {
    return this.usersSqlQueryRepository.getAll(queryParams);
  }
}
