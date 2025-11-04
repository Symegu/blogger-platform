import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { UsersSqlQueryRepository } from '../../infrastructure/query/users-sql.query-repository';

export class GetUserByIdQuery {
  constructor(public userId: number) {}
}

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(private usersSqlQueryRepository: UsersSqlQueryRepository) {}

  async execute(query: GetUserByIdQuery) {
    return this.usersSqlQueryRepository.getByIdOrNotFoundFail(query.userId);
  }
}
