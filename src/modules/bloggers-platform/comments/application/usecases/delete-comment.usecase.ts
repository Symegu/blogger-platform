import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';
import { UserContextDto } from 'src/modules/user-accounts/dto/create-user.dto';

import { CommentsRepository } from '../../infrastructure/comments.repository';

export class DeleteCommentCommand {
  constructor(
    public commentId: Types.ObjectId,
    public user: UserContextDto,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommand> {
  constructor(private commentsRepository: CommentsRepository) {}
  async execute({ commentId, user }: DeleteCommentCommand): Promise<void> {
    const comment = await this.commentsRepository.findOrNotFoundFail(commentId);
    await this.ensureSameUser(user.id, comment.commentatorInfo.userId);
    comment.makeDeleted();
    await this.commentsRepository.save(comment);
    return;
  }

  private async ensureSameUser(
    userId: Types.ObjectId,
    commentUserId: Types.ObjectId,
  ): Promise<void> {
    const commentUserObjectId = new Types.ObjectId(commentUserId);
    const requestUserObjectId = new Types.ObjectId(userId);

    if (!commentUserObjectId.equals(requestUserObjectId)) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'User tries to delete another user comment',
      });
    }
  }
}
