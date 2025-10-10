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
import { ExtractUserFromRequest } from 'src/core/decorators/param/extract-user-from-request';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { UserContextDto } from 'src/modules/user-accounts/dto/create-user.dto';
import { JwtAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-auth.guard';

import {
  CreatePostInputDto,
  GetPostsQueryParams,
  UpdatePostInputDto,
} from './input-dto/posts.input-dto';
import { PostViewDto } from './view-dto/posts.view-dto';
import {
  CreateCommentInputDto,
  GetCommentsQueryParams,
} from '../../comments/api/input-dto/comment.input-dto';
import { CommentViewDto } from '../../comments/api/view-dto/comment.view-dto';
import { GetAllCommentsQuery } from '../../comments/application/queries/get-all-comments.query';
// import { BlogsQueryRepository } from '../../blogs/infrastructure/query/blogs.query.repository';
import { CreateCommentCommand } from '../../comments/application/usecases/create-comment.usecase';
import { GetAllPostsQuery } from '../application/queries/get-all-posts.query';
import { GetPostByIdQuery } from '../application/queries/get-post-by-id.query';
import { CreatePostCommand } from '../application/usecases/create-post.usecase';
import { DeletePostCommand } from '../application/usecases/delete-post.usecase';
import { UpdatePostCommand } from '../application/usecases/update-post.usecase';

@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {
    console.log('Posts controller created');
  }

  @Get(':id')
  async getById(@Param('id') id: Types.ObjectId) {
    return this.queryBus.execute(new GetPostByIdQuery(id));
  }

  @Get()
  async getAll(@Query() query: GetPostsQueryParams): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute(new GetAllPostsQuery(query));
  }

  @Post()
  async createPost(@Body() body: CreatePostInputDto): Promise<PostViewDto> {
    return this.commandBus.execute(
      new CreatePostCommand(body, body.blogId ? body.blogId : new Types.ObjectId()),
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: Types.ObjectId, @Body() body: UpdatePostInputDto): Promise<void> {
    return this.commandBus.execute(new UpdatePostCommand(body, body.blogId, id));
  }

  //@ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: Types.ObjectId): Promise<void> {
    return this.commandBus.execute(new DeletePostCommand(id));
  }

  @Get(':postId/comments')
  async getPostsForBlog(
    @Param('postId') postId: Types.ObjectId,
    @Query() query: GetCommentsQueryParams,
    // @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    return this.queryBus.execute(new GetAllCommentsQuery(query, postId)); //(query, postId, user)
  }

  @Post(':postId/comments')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async createCommentForPost(
    @Param('postId') postId: Types.ObjectId,
    @Body() body: CreateCommentInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<CommentViewDto> {
    return this.commandBus.execute(new CreateCommentCommand(postId, body, user));
  }
}
