import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query.repository';
import { BlogsService } from '../application/blogs.service';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { BlogViewDto } from './view-dto/blogs.view-dto';
import {
  CreateBlogInputDto,
  GetBlogsQueryParams,
  UpdateBlogInputDto,
} from './input-dto/blogs.input-dto';
import {
  CreatePostInputDto,
  GetPostsQueryParams,
} from '../../posts/api/input-dto/posts.input-dto';
import { PostViewDto } from '../../posts/api/view-dto/posts.view-dto';
import { PostsQueryRepository } from '../../posts/infrastructure/query/posts.query-repository';
import { PostsService } from '../../posts/application/posts.service';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private blogsService: BlogsService,
    private postsQueryRepository: PostsQueryRepository,
    private postsService: PostsService,
  ) {
    console.log('Blogs controller created');
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.blogsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Get()
  async getAll(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.blogsQueryRepository.getAll(query);
  }

  @Post()
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const blogId = await this.blogsService.createBlog(body);
    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') id: string,
    @Body() body: UpdateBlogInputDto,
  ): Promise<BlogViewDto> {
    const blogId = await this.blogsService.updateBlog(id, body);
    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  //@ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    return await this.blogsService.deleteBlog(id);
  }

  @Get(':blogId/posts')
  async getPostsForBlog(
    @Param('blogId') blogId: string,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
    return this.postsQueryRepository.getAll(query, blogId);
  }

  @Post(':blogId/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPostForBlog(
    @Param('blogId') blogId: string,
    @Body() body: CreatePostInputDto,
  ): Promise<PostViewDto> {
    const blog = await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
    const postId = await this.postsService.createPost({
      ...body,
      blogId,
      blogName: blog.name,
    });
    return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  }
}
