import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { BlogViewDto } from 'src/modules/bloggers-platform/blogs/api/view-dto/blogs.view-dto';
import { BlogsQueryRepository } from 'src/modules/bloggers-platform/blogs/infrastructure/query/blogs.query.repository';

import { CreatePostForBlogInputDto } from '../../api/input-dto/posts.input-dto';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { CreatePostDomainDto } from '../../dto/create-post.dto';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PostsFactory } from '../factories/posts.factory';

export class CreatePostCommand {
  constructor(
    public dto: CreatePostForBlogInputDto,
    public blogId: Types.ObjectId,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand, PostViewDto> {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsRepository: PostsRepository,
    private readonly postsFactory: PostsFactory,
  ) {}

  async execute({ dto, blogId }: CreatePostCommand): Promise<PostViewDto> {
    const blog = await this.ensureBlogExists(blogId);
    const post = await this.postsFactory.create({
      ...dto,
      blogId: blogId,
      blogName: blog.name,
    } as CreatePostDomainDto);

    await this.postsRepository.save(post);
    return PostViewDto.mapToView(post);
  }

  private async ensureBlogExists(blogId: Types.ObjectId): Promise<BlogViewDto> {
    return await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }
}
