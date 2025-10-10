import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';
import { UserContextDto } from 'src/modules/user-accounts/dto/create-user.dto';

import { UpdateCommentInputDto } from '../../api/input-dto/comment.input-dto';
import { CommentDocument } from '../../domain/comments.entity';
import { CommentsRepository } from '../../infrastructure/comments.repository';

export class UpdateCommentCommand {
  constructor(
    public commentId: Types.ObjectId,
    public dto: UpdateCommentInputDto,
    public user: UserContextDto,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand, void> {
  constructor(private commentsRepository: CommentsRepository) {}
  async execute({ commentId, dto, user }: UpdateCommentCommand): Promise<void> {
    console.log('UpdateCommentUseCase', commentId, dto, user);

    const comment = await this.ensureCommentExists(commentId);
    console.log('found comment', comment);

    await this.ensureSameUser(comment.commentatorInfo.userId, user.id);
    console.log('User is allowed to change this comment');

    comment.update(dto);
    await this.commentsRepository.save(comment);
    return;
  }

  private async ensureCommentExists(commentId: Types.ObjectId): Promise<CommentDocument> {
    return await this.commentsRepository.findOrNotFoundFail(commentId);
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
        message: 'User tries to change another user comment',
      });
    }
  }
}
