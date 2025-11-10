import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';
import { UserContextDto } from 'src/modules/user-accounts/dto/create-user.dto';

import { CommentsSqlRepository } from '../../infrastructure/comments-sql.repository';

export class DeleteCommentCommand {
  constructor(
    public commentId: number,
    public user: UserContextDto,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommand> {
  constructor(private commentsSqlRepository: CommentsSqlRepository) {}
  async execute({ commentId, user }: DeleteCommentCommand): Promise<void> {
    const comment = await this.commentsSqlRepository.findOrNotFoundFail(commentId);
    await this.ensureSameUser(user.id, comment.user_id);
    await this.commentsSqlRepository.delete(commentId);
    return;
  }

  private async ensureSameUser(userId: number, commentUserId: number): Promise<void> {
    if (+userId !== +commentUserId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'User tries to delete another user comment',
      });
    }
  }
}
