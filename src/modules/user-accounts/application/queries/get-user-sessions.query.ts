import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SessionsQueryRepository } from '../../infrastructure/query/sessions.query-repository';
import { SessionsService } from '../sessions.service';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';
export class GetUserSessionsQuery {
  constructor(public readonly refreshToken: string) {}
}

@QueryHandler(GetUserSessionsQuery)
export class GetUserSessionsQueryHandler implements IQueryHandler<GetUserSessionsQuery> {
  constructor(
    private sessionsQueryRepository: SessionsQueryRepository,
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
    console.log(payload);

    const sessions = await this.sessionsQueryRepository.findByUserId(payload.userId);

    return sessions;
  }
}
