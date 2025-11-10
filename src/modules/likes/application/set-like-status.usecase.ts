import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';
//import { PostsRepository } from 'src/modules/bloggers-platform/posts/infrastructure/posts.repository';
import { LikesFactory } from 'src/modules/likes/application/factories/like.factory';
import { LikeableEntity, LikeStatus } from 'src/modules/likes/domain/like.entity';
import { UserContextDto } from 'src/modules/user-accounts/dto/create-user.dto';

// import { CommentsRepository } from '../../bloggers-platform/comments/infrastructure/comments.repository';
import { LikesService } from './likes.service';
import { LikesSqlRepository } from '../infrastructure/likes-sql.repository';

export class SetLikeStatusCommand {
  constructor(
    public readonly entityId: number,
    public readonly entityType: LikeableEntity,
    public readonly likeStatus: LikeStatus,
    public readonly user: UserContextDto,
  ) {}
}

@CommandHandler(SetLikeStatusCommand)
export class SetLikeStatusUseCase implements ICommandHandler<SetLikeStatusCommand, void> {
  constructor(
    private readonly likesSqlRepository: LikesSqlRepository,
    private readonly likesFactory: LikesFactory,
    private readonly likesService: LikesService,
  ) {}

  async execute({ entityId, entityType, likeStatus, user }: SetLikeStatusCommand): Promise<void> {
    const existing = await this.likesSqlRepository.findByUserAndEntity(
      user.id,
      entityId,
      entityType,
    );

    if (existing.length === 0) {
      if (likeStatus === 'None') return;
      await this.createLike(entityId, entityType, likeStatus, user);
    } else {
      if (existing[0].status === likeStatus) return;
      await this.updateLike(entityId, entityType, likeStatus, user);
    }

    await this.likesService.updateCounters(entityId, entityType);
  }

  private async createLike(
    entityId: number,
    entityType: LikeableEntity,
    likeStatus: LikeStatus,
    user: UserContextDto,
  ) {
    const newLike = await this.likesFactory.create(
      user.id,
      user.login,
      entityType,
      entityId,
      likeStatus,
    );

    await this.likesSqlRepository.create(
      newLike.user_id,
      newLike.entity_id,
      newLike.entity,
      newLike.status,
    );
  }

  private async updateLike(
    entityId: number,
    entityType: LikeableEntity,
    likeStatus: LikeStatus,
    user: UserContextDto,
  ) {
    await this.likesSqlRepository.update(user.id, entityId, entityType, likeStatus);
  }
}
