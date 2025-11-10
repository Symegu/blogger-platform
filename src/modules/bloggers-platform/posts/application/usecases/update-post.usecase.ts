import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogViewDto } from 'src/modules/bloggers-platform/blogs/api/view-dto/blogs.view-dto';
import { BlogsSqlQueryRepository } from 'src/modules/bloggers-platform/blogs/infrastructure/query/blogs-sql.query-repository';

import { UpdatePostInputDto } from '../../api/input-dto/posts.input-dto';
import { PostsSqlRepository } from '../../infrastructure/posts-sql.repository';

export class UpdatePostCommand {
  constructor(
    public dto: UpdatePostInputDto,
    public blogId: number,
    public postId: number,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand, void> {
  constructor(
    private postsSqlRepository: PostsSqlRepository,
    private blogsSqlQueryRepository: BlogsSqlQueryRepository,
  ) {}
  async execute({ dto, blogId, postId }: UpdatePostCommand): Promise<void> {
    await this.ensureBlogExists(blogId);
    await this.postsSqlRepository.findOrNotFoundFail(postId);
    await this.postsSqlRepository.update(postId, { ...dto, blogId });
    return;
  }

  private async ensureBlogExists(blogId: number): Promise<BlogViewDto> {
    return await this.blogsSqlQueryRepository.getByIdOrNotFoundFail(blogId);
  }
}
