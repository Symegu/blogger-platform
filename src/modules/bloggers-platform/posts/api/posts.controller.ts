import { PostsQueryRepository } from './../infrastructure/query/posts.query-repository';
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
import { PostsService } from '../application/posts.service';
import {
  CreatePostInputDto,
  GetPostsQueryParams,
  UpdatePostInputDto,
} from './input-dto/posts.input-dto';
import { PostViewDto } from './view-dto/posts.view-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { BlogsQueryRepository } from '../../blogs/infrastructure/query/blogs.query.repository';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {
    console.log('Posts controller created');
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.postsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Get()
  async getAll(
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.postsQueryRepository.getAll(query);
  }

  @Post()
  async createPost(@Body() body: CreatePostInputDto): Promise<PostViewDto> {
    const blog = await this.blogsQueryRepository.getByIdOrNotFoundFail(
      body.blogId,
    );
    const blogName = blog.name;
    const postId = await this.postsService.createPost({ ...body, blogName });
    return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id') id: string,
    @Body() body: UpdatePostInputDto,
  ): Promise<PostViewDto> {
    const postId = await this.postsService.updatePost(id, body);
    return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  }

  //@ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string): Promise<void> {
    return await this.postsService.deletePost(id);
  }
}
