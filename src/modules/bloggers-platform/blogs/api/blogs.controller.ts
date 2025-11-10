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
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ExtractUserFromRequest } from 'src/core/decorators/param/extract-user-from-request';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { UserContextDto } from 'src/modules/user-accounts/dto/create-user.dto';
import { BasicAuthGuard } from 'src/modules/user-accounts/guards/basic/basic-auth.guard';
import { JwtOptionalAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-optional-auth.guard';

import { CreateBlogInputDto, GetBlogsQueryParams } from './input-dto/blogs.input-dto';
import { BlogViewDto } from './view-dto/blogs.view-dto';
import {
  CreatePostForBlogInputDto,
  GetPostsQueryParams,
  UpdatePostInputDto,
} from '../../posts/api/input-dto/posts.input-dto';
import { PostViewDto } from '../../posts/api/view-dto/posts.view-dto';
import { GetAllPostsQuery } from '../../posts/application/queries/get-all-posts.query';
import { CreatePostCommand } from '../../posts/application/usecases/create-post.usecase';
import { DeletePostCommand } from '../../posts/application/usecases/delete-post.usecase';
import { UpdatePostCommand } from '../../posts/application/usecases/update-post.usecase';
import { GetAllBlogsQuery } from '../application/queries/get-all-blogs.query';
import { GetBlogByIdQuery } from '../application/queries/get-blog-by-id.query';
import { CreateBlogCommand } from '../application/usecases/create-blog.usecase';
import { DeleteBlogCommand } from '../application/usecases/delete-blog.usecase';
import { UpdateBlogCommand } from '../application/usecases/update-blog.usecase';
import { UpdateBlogInputDto } from '../dto/create-blog.dto';
//import { GetPostByIdQuery } from '../../posts/application/queries/get-post-by-id.query';

@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class BlogsSaController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {
    console.log('Blogs1 controller created');
  }

  @Get()
  async getAll(@Query() query: GetBlogsQueryParams): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.queryBus.execute(new GetAllBlogsQuery(query));
  }

  // @Get(':id')
  // async getById(@Param('id') id: number): Promise<BlogViewDto> {
  //   return this.queryBus.execute(new GetBlogByIdQuery(id));
  // }

  @Post()
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const blogId = await this.commandBus.execute(new CreateBlogCommand(body));
    return this.queryBus.execute(new GetBlogByIdQuery(blogId));
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Param('id') id: number, @Body() body: UpdateBlogInputDto): Promise<void> {
    return this.commandBus.execute(new UpdateBlogCommand(body, id));
  }

  //@ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: number): Promise<void> {
    return await this.commandBus.execute(new DeleteBlogCommand(id));
  }

  @Post(':blogId/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPostForBlog(
    @Param('blogId') blogId: number,
    @Body() body: CreatePostForBlogInputDto,
  ): Promise<PostViewDto> {
    console.log('blogId', blogId, body);

    return this.commandBus.execute(new CreatePostCommand(body, +blogId));
  }

  @Get(':blogId/posts')
  @UseGuards(JwtOptionalAuthGuard)
  async getAllPostForBlog(
    @Query() query: GetPostsQueryParams,
    @Param('blogId') blogId: number,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute(new GetAllPostsQuery({ ...query, blogId }, user));
  }

  @Put(':blogId/posts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostForBlog(
    @Param('blogId') blogId: number,
    @Param('id') id: number,
    @Body() body: UpdatePostInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new UpdatePostCommand(body, +blogId, +id));
  }

  //@ApiParam({ name: 'id' }) //для сваггера
  @Delete(':blogId/posts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostForBlog(@Param('blogId') blogId: number, @Param('id') id: number): Promise<void> {
    await this.queryBus.execute(new GetBlogByIdQuery(blogId));
    return this.commandBus.execute(new DeletePostCommand(id));
  }
}

@Controller('blogs')
export class BlogsController {
  constructor(private readonly queryBus: QueryBus) {
    console.log('Blogs2 controller created');
  }

  @Get(':id')
  async getById(@Param('id') id: number): Promise<BlogViewDto> {
    return this.queryBus.execute(new GetBlogByIdQuery(id));
  }

  @Get()
  async getAll(@Query() query: GetBlogsQueryParams): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.queryBus.execute(new GetAllBlogsQuery(query));
  }

  @Get(':blogId/posts')
  @UseGuards(JwtOptionalAuthGuard)
  async getPostsForBlog(
    @Param('blogId') blogId: number,
    @Query() query: GetPostsQueryParams,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    await this.queryBus.execute(new GetBlogByIdQuery(blogId));
    return this.queryBus.execute(new GetAllPostsQuery({ ...query, blogId }, user));
  }
}
