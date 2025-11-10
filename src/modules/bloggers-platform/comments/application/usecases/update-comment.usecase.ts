import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';
import { UserContextDto } from 'src/modules/user-accounts/dto/create-user.dto';

import { UpdateCommentInputDto } from '../../api/input-dto/comment.input-dto';
import { CommentData } from '../../domain/comments.entity';
import { CommentsSqlRepository } from '../../infrastructure/comments-sql.repository';

export class UpdateCommentCommand {
  constructor(
    public commentId: number,
    public dto: UpdateCommentInputDto,
    public user: UserContextDto,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand, void> {
  constructor(private commentsSqlRepository: CommentsSqlRepository) {}
  async execute({ commentId, dto, user }: UpdateCommentCommand): Promise<void> {
    console.log(commentId, dto, user);

    const comment = await this.ensureCommentExists(commentId);
    await this.ensureSameUser(comment.user_id, user.id);
    await this.commentsSqlRepository.update({
      id: commentId,
      user_id: user.id,
      content: dto.content,
    });
    return;
  }

  private async ensureCommentExists(commentId: number): Promise<CommentData> {
    return await this.commentsSqlRepository.findOrNotFoundFail(commentId);
  }

  private async ensureSameUser(userId: number, commentUserId: number): Promise<void> {
    if (+commentUserId !== +userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'User tries to change another user comment',
      });
    }
  }
}
