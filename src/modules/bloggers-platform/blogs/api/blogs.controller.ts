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
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';

import { CreateBlogInputDto, GetBlogsQueryParams } from './input-dto/blogs.input-dto';
import { BlogViewDto } from './view-dto/blogs.view-dto';
import {
  CreatePostForBlogInputDto,
  GetPostsQueryParams,
} from '../../posts/api/input-dto/posts.input-dto';
import { PostViewDto } from '../../posts/api/view-dto/posts.view-dto';
import { GetAllPostsQuery } from '../../posts/application/queries/get-all-posts.query';
import { CreatePostCommand } from '../../posts/application/usecases/create-post.usecase';
import { GetAllBlogsQuery } from '../application/queries/get-all-blogs.query';
import { GetBlogByIdQuery } from '../application/queries/get-blog-by-id.query';
import { CreateBlogCommand } from '../application/usecases/create-blog.usecase';
import { DeleteBlogCommand } from '../application/usecases/delete-blog.usecase';
import { UpdateBlogCommand } from '../application/usecases/update-blog.usecase';
import { UpdateBlogInputDto } from '../dto/create-blog.dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {
    console.log('Blogs controller created');
  }

  @Get(':id')
  async getById(@Param('id') id: Types.ObjectId): Promise<BlogViewDto> {
    return this.queryBus.execute(new GetBlogByIdQuery(id));
  }

  @Get()
  async getAll(@Query() query: GetBlogsQueryParams): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.queryBus.execute(new GetAllBlogsQuery(query));
  }

  @Post()
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    return await this.commandBus.execute(new CreateBlogCommand(body));
    // return this.queryBus.execute(new GetBlogByIdQuery(blogId));
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') id: Types.ObjectId,
    @Body() body: UpdateBlogInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new UpdateBlogCommand(body, id));
  }

  //@ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: Types.ObjectId): Promise<void> {
    return await this.commandBus.execute(new DeleteBlogCommand(id));
  }

  @Get(':blogId/posts')
  async getPostsForBlog(
    @Param('blogId') blogId: Types.ObjectId,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute(new GetAllPostsQuery({ ...query, blogId }));
  }

  @Post(':blogId/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPostForBlog(
    @Param('blogId') blogId: Types.ObjectId,
    @Body() body: CreatePostForBlogInputDto,
  ): Promise<PostViewDto> {
    console.log('blogId', blogId, body);

    return this.commandBus.execute(new CreatePostCommand(body, blogId));
  }
}
