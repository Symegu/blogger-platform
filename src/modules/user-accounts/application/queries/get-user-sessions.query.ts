import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';

import { SessionsSqlQueryRepository } from '../../infrastructure/query/sessions-sql.query-repository';
import { SessionsService } from '../sessions.service';

export class GetUserSessionsQuery {
  constructor(public readonly refreshToken: string) {}
}

@QueryHandler(GetUserSessionsQuery)
export class GetUserSessionsQueryHandler implements IQueryHandler<GetUserSessionsQuery> {
  constructor(
    private sessionsSqlQueryRepository: SessionsSqlQueryRepository,
    private sessionsService: SessionsService,
  ) {}
  async execute({ refreshToken }: GetUserSessionsQuery): Promise<any> {
    if (!refreshToken) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'No refresh token provided',
      });
    }
    const payload = await this.sessionsService.validateRefreshToken(refreshToken);
    console.log('payload', payload);

    const sessions = await this.sessionsSqlQueryRepository.findByUserId(payload.userId);

    return sessions;
  }
}
