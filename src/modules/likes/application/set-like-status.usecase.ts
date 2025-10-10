import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
// import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';
import { PostsRepository } from 'src/modules/bloggers-platform/posts/infrastructure/posts.repository';
import { LikesFactory } from 'src/modules/likes/application/factories/like.factory';
import { LikeableEntity, LikeStatus } from 'src/modules/likes/domain/like.entity';
import { UserContextDto } from 'src/modules/user-accounts/dto/create-user.dto';

import { CommentsRepository } from '../../bloggers-platform/comments/infrastructure/comments.repository';
import { LikesRepository } from '../infrastructure/likes.repository';

export class SetLikeStatusCommand {
  constructor(
    public readonly entityId: Types.ObjectId,
    public readonly entityType: LikeableEntity, // 'Post' | 'Comment'
    public readonly likeStatus: LikeStatus,
    public readonly user: UserContextDto,
  ) {}
}

@CommandHandler(SetLikeStatusCommand)
export class SetLikeStatusUseCase implements ICommandHandler<SetLikeStatusCommand, void> {
  constructor(
    private readonly likesRepository: LikesRepository,
    private readonly likesFactory: LikesFactory,
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async execute({ entityId, entityType, likeStatus, user }: SetLikeStatusCommand): Promise<void> {
    // Проверяем, что сущность существует
    const entity =
      entityType === LikeableEntity.Post
        ? await this.postsRepository.findOrNotFoundFail(entityId)
        : await this.commentsRepository.findOrNotFoundFail(entityId);

    // Проверяем, есть ли уже лайк от пользователя
    const existingLike = await this.likesRepository.findByUserAndEntity(
      user.id,
      entityId,
      entityType,
    );

    if (!existingLike) {
      // Нет лайка — если статус None, ничего не делаем
      if (likeStatus === LikeStatus.None) return;

      const newLike = await this.likesFactory.create({
        userId: user.id,
        userLogin: user.login,
        entity: entityType,
        entityId,
        status: likeStatus,
      });
      await this.likesRepository.save(newLike);
    } else {
      // Есть лайк — если статус не изменился, ничего не делаем
      if (existingLike.status === likeStatus) return;

      // Если статус None — просто удаляем лайк
      if (likeStatus === LikeStatus.None) {
        await existingLike.deleteOne();
      } else {
        existingLike.updateStatus(likeStatus);
        await this.likesRepository.save(existingLike);
      }
    }

    // Пересчитываем и обновляем счётчики
    await this.updateEntityLikeCounters(entityId, entityType);
  }

  private async updateEntityLikeCounters(
    entityId: Types.ObjectId,
    entityType: LikeableEntity,
  ): Promise<void> {
    const likesCount = await this.likesRepository.countByStatus(
      entityId,
      entityType,
      LikeStatus.Like,
    );
    const dislikesCount = await this.likesRepository.countByStatus(
      entityId,
      entityType,
      LikeStatus.Dislike,
    );

    // newestLikes — только для постов (по спецификации)
    let newestMapped: { addedAt: Date; userId: string; login: string }[] = [];

    if (entityType === LikeableEntity.Post) {
      const newest = await this.likesRepository.newestLikes(entityId, entityType, 3);
      newestMapped = newest.map(l => ({
        addedAt: l.createdAt,
        userId: l.userId.toString(),
        login: l.userLogin,
      }));
      // обновляем пост (likes + newest)
      await this.postsRepository.updateLikeCountersAndNewest(
        entityId,
        likesCount,
        dislikesCount,
        newestMapped,
      );
    } else {
      // комментарии — обновляем только счётчики
      await this.commentsRepository.updateLikeCounters(entityId, likesCount, dislikesCount);
    }
  }
}
