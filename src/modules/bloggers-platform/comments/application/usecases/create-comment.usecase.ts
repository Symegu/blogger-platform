import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { PostViewDto } from 'src/modules/bloggers-platform/posts/api/view-dto/posts.view-dto';
import { PostsQueryRepository } from 'src/modules/bloggers-platform/posts/infrastructure/query/posts.query-repository';

import { UserContextDto } from '../../../../../modules/user-accounts/dto/create-user.dto';
import { CreateCommentInputDto } from '../../api/input-dto/comment.input-dto';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import { CommentDocument } from '../../domain/comments.entity';
import { CommentsFactory } from '../factories/comments.factory';

export class CreateCommentCommand {
  constructor(
    public readonly postId: Types.ObjectId,
    public readonly dto: CreateCommentInputDto,
    public readonly user: UserContextDto,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand> {
  constructor(
    private readonly commentsFactory: CommentsFactory,
    // @InjectModel(Comment.name)
    // private CommentModel: CommentModelType,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute({ postId, dto, user }: CreateCommentCommand): Promise<CommentViewDto> {
    await this.ensurePostExists(postId);
    const comment: CommentDocument = await this.commentsFactory.create(
      dto,
      user.id,
      user.login,
      postId,
    );

    await comment.save();
    return CommentViewDto.mapToView(comment);
  }

  private async ensurePostExists(postId: Types.ObjectId): Promise<PostViewDto> {
    return await this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  }
}
