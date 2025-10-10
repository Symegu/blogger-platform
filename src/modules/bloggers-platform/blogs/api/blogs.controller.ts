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
import { Types } from 'mongoose';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { BasicAuthGuard } from 'src/modules/user-accounts/guards/basic/basic-auth.guard';
import { JwtOptionalAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-optional-auth.guard';

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
import { ExtractUserFromRequest } from 'src/core/decorators/param/extract-user-from-request';
import { UserContextDto } from 'src/modules/user-accounts/dto/create-user.dto';

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
  @UseGuards(BasicAuthGuard)
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    return await this.commandBus.execute(new CreateBlogCommand(body));
    // return this.queryBus.execute(new GetBlogByIdQuery(blogId));
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') id: Types.ObjectId,
    @Body() body: UpdateBlogInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new UpdateBlogCommand(body, id));
  }

  //@ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: Types.ObjectId): Promise<void> {
    return await this.commandBus.execute(new DeleteBlogCommand(id));
  }

  @Get(':blogId/posts')
  @UseGuards(JwtOptionalAuthGuard)
  async getPostsForBlog(
    @Param('blogId') blogId: Types.ObjectId,
    @Query() query: GetPostsQueryParams,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    await this.queryBus.execute(new GetBlogByIdQuery(blogId)); //проверка что блог существуетs
    return this.queryBus.execute(new GetAllPostsQuery({ ...query, blogId }, user));
  }

  @Post(':blogId/posts')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPostForBlog(
    @Param('blogId') blogId: Types.ObjectId,
    @Body() body: CreatePostForBlogInputDto,
  ): Promise<PostViewDto> {
    console.log('blogId', blogId, body);

    return this.commandBus.execute(new CreatePostCommand(body, blogId));
  }
}
