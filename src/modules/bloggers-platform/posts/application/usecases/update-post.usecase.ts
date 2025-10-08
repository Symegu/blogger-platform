import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { BlogViewDto } from 'src/modules/bloggers-platform/blogs/api/view-dto/blogs.view-dto';
import { BlogsQueryRepository } from 'src/modules/bloggers-platform/blogs/infrastructure/query/blogs.query.repository';

import { UpdatePostInputDto } from '../../api/input-dto/posts.input-dto';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class UpdatePostCommand {
  constructor(
    public dto: UpdatePostInputDto,
    public blogId: Types.ObjectId,
    public postId: Types.ObjectId,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand, void> {
  constructor(
    private postsRepository: PostsRepository,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}
  async execute({ dto, blogId, postId }: UpdatePostCommand): Promise<void> {
    await this.ensureBlogExists(blogId);
    const post = await this.postsRepository.findOrNotFoundFail(postId);
    post.update(dto);
    await this.postsRepository.save(post);
    return;
  }

  private async ensureBlogExists(blogId: Types.ObjectId): Promise<BlogViewDto> {
    return await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }
}
