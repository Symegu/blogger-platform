import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';
import { BlogViewDto } from 'src/modules/bloggers-platform/blogs/api/view-dto/blogs.view-dto';
import { BlogsSqlQueryRepository } from 'src/modules/bloggers-platform/blogs/infrastructure/query/blogs-sql.query-repository';
import { ExtendedLikesInfoViewDto } from 'src/modules/likes/api/view-dto/like.view-dto';

import { LikesService } from '../../../../likes/application/likes.service';
import { CreatePostForBlogInputDto } from '../../api/input-dto/posts.input-dto';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { CreatePostDto } from '../../dto/create-post.dto';
import { PostsSqlRepository } from '../../infrastructure/posts-sql.repository';
import { PostsFactory } from '../factories/posts.factory';

export class CreatePostCommand {
  constructor(
    public dto: CreatePostForBlogInputDto,
    public blogId: number,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand, PostViewDto> {
  constructor(
    private readonly blogsSqlQueryRepository: BlogsSqlQueryRepository,
    private readonly postsFactory: PostsFactory,
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly likesService: LikesService,
  ) {}

  async execute({ dto, blogId }: CreatePostCommand): Promise<PostViewDto> {
    const blog = await this.ensureBlogExists(blogId);
    const post = await this.postsFactory.create(
      {
        ...dto,
        blogId: blogId,
      } as CreatePostDto,
      blog.name,
    );
    console.log('execute post', post);

    const postId = await this.postsSqlRepository.create(post);
    console.log('execute postId', postId);

    const createdPost = await this.postsSqlRepository.findById(postId);
    console.log('execute createdPost', createdPost);
    const extendedLikesInfo = (await this.likesService.buildLikesInfo(
      postId,
      'Post',
      null,
    )) as ExtendedLikesInfoViewDto;
    console.log('execute extendedLikesInfo', extendedLikesInfo);
    if (!createdPost) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }
    return PostViewDto.mapFromSql({
      id: createdPost.id,
      title: createdPost.title,
      short_description: createdPost.short_description,
      content: createdPost.content,
      blog_id: createdPost.blog_id,
      blog_name: createdPost.blog_name,
      created_at: createdPost.created_at,
      extendedLikesInfo: {
        likesCount: extendedLikesInfo.likesCount,
        dislikesCount: extendedLikesInfo.dislikesCount,
        myStatus: extendedLikesInfo.myStatus,
        newestLikes: extendedLikesInfo.newestLikes,
      },
    });
  }

  private async ensureBlogExists(blogId: number): Promise<BlogViewDto> {
    return await this.blogsSqlQueryRepository.getByIdOrNotFoundFail(blogId);
  }
}
