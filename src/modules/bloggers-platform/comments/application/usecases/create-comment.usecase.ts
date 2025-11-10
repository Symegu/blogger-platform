import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';
import { PostsSqlQueryRepository } from 'src/modules/bloggers-platform/posts/infrastructure/query/posts-sql.query-repository';
import { LikesInfoViewDto } from 'src/modules/likes/api/view-dto/like.view-dto';

import { UserContextDto } from '../../../../../modules/user-accounts/dto/create-user.dto';
import { LikesService } from '../../../../likes/application/likes.service';
import { CreateCommentInputDto } from '../../api/input-dto/comment.input-dto';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import { CommentsSqlRepository } from '../../infrastructure/comments-sql.repository';
import { CommentsFactory } from '../factories/comments.factory';

export class CreateCommentCommand {
  constructor(
    public readonly postId: number,
    public readonly dto: CreateCommentInputDto,
    public readonly user: UserContextDto,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand> {
  constructor(
    private readonly commentsFactory: CommentsFactory,
    private readonly likesService: LikesService,
    private readonly postsSqlQueryRepository: PostsSqlQueryRepository,
    private readonly commentsSqlRepository: CommentsSqlRepository,
  ) {}

  async execute({ postId, dto, user }: CreateCommentCommand): Promise<CommentViewDto> {
    await this.ensurePostExists(postId);
    const comment = await this.commentsFactory.create(dto, user.id, user.login, postId);
    console.log('execute comment', comment);
    const newCommentId = await this.commentsSqlRepository.create(comment);
    console.log('execute newComment', newCommentId);
    const createdComment = await this.commentsSqlRepository.findById(newCommentId);
    console.log('execute newComment', createdComment);
    const likesInfo = (await this.likesService.buildLikesInfo(
      newCommentId,
      'Comment',
      user.id,
    )) as LikesInfoViewDto;
    console.log('execute commentWithLikes', likesInfo);
    if (!createdComment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }
    return CommentViewDto.mapFromSql({
      id: createdComment.id,
      content: createdComment.content,
      user_id: createdComment.user_id,
      user_login: createdComment.user_login,
      created_at: createdComment.created_at,
      likesInfo: {
        likesCount: likesInfo?.likesCount ?? 0,
        dislikesCount: likesInfo?.dislikesCount ?? 0,
        myStatus: likesInfo?.myStatus ?? 'None',
      },
    });
  }

  private async ensurePostExists(postId: number) {
    return await this.postsSqlQueryRepository.getByIdOrNotFoundFail(postId);
  }
}
