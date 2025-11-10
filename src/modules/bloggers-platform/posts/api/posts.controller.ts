import {
  Body,
  Controller,
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
import { LikeInputModel } from 'src/modules/likes/api/input-dto/like.input-dto';
import { SetLikeStatusCommand } from 'src/modules/likes/application/set-like-status.usecase';
import { UserContextDto } from 'src/modules/user-accounts/dto/create-user.dto';
import { JwtAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-auth.guard';
import { JwtOptionalAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-optional-auth.guard';

import { GetPostsQueryParams } from './input-dto/posts.input-dto';
import { PostViewDto } from './view-dto/posts.view-dto';
import {
  CreateCommentInputDto,
  GetCommentsQueryParams,
} from '../../comments/api/input-dto/comment.input-dto';
import { CommentViewDto } from '../../comments/api/view-dto/comment.view-dto';
//import { GetAllCommentsQuery } from '../../comments/application/queries/get-all-comments.query';
import { GetAllCommentsQuery } from '../../comments/application/queries/get-all-comments.query';
import { CreateCommentCommand } from '../../comments/application/usecases/create-comment.usecase';
import { GetAllPostsQuery } from '../application/queries/get-all-posts.query';
import { GetPostByIdQuery } from '../application/queries/get-post-by-id.query';
// import { CreatePostCommand } from '../application/usecases/create-post.usecase';
// import { DeletePostCommand } from '../application/usecases/delete-post.usecase';
// import { UpdatePostCommand } from '../application/usecases/update-post.usecase';

@Controller('sa/posts')
export class PostsSaController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {
    console.log('Posts2 controller created');
  }

  // @Get(':id')
  // @UseGuards(JwtOptionalAuthGuard)
  // async getById(@Param('id') id: number, @ExtractUserFromRequest() user: UserContextDto) {
  //   return this.queryBus.execute(new GetPostByIdQuery(id, user));
  // }

  // @Get()
  // @UseGuards(JwtOptionalAuthGuard)
  // async getAll(
  //   @Query() query: GetPostsQueryParams,
  //   @ExtractUserFromRequest() user: UserContextDto,
  // ): Promise<PaginatedViewDto<PostViewDto[]>> {
  //   return this.queryBus.execute(new GetAllPostsQuery(query, user));
  // }

  // @Post()
  // @UseGuards(BasicAuthGuard)
  // async createPost(@Body() body: CreatePostInputDto): Promise<PostViewDto> {
  //   return this.commandBus.execute(new CreatePostCommand(body, +body.blogId));
  // }

  // @Put(':id')
  // @UseGuards(BasicAuthGuard)
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async update(@Param('id') id: number, @Body() body: UpdatePostInputDto): Promise<void> {
  //   return this.commandBus.execute(new UpdatePostCommand(body, +body.blogId!, +id));
  // }

  // //@ApiParam({ name: 'id' }) //для сваггера
  // @Delete(':id')
  // @UseGuards(BasicAuthGuard)
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async deletePost(@Param('id') id: number): Promise<void> {
  //   return this.commandBus.execute(new DeletePostCommand(id));
  // }
}

@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {
    console.log('Posts controller created');
  }

  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  async getById(@Param('id') id: number, @ExtractUserFromRequest() user: UserContextDto) {
    console.log('JwtOptionalAuthGuard', user);

    return this.queryBus.execute(new GetPostByIdQuery(id, user));
  }

  @Get()
  @UseGuards(JwtOptionalAuthGuard)
  async getAll(
    @Query() query: GetPostsQueryParams,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute(new GetAllPostsQuery(query, user));
  }

  @Put(':postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async setLikeStatusForPost(
    @Param('postId') postId: number,
    @Body() body: LikeInputModel,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<CommentViewDto> {
    await this.queryBus.execute(new GetPostByIdQuery(postId, user));
    return this.commandBus.execute(new SetLikeStatusCommand(postId, 'Post', body.likeStatus, user));
  }

  @Get(':postId/comments')
  @UseGuards(JwtOptionalAuthGuard)
  async getPostsForBlog(
    @Param('postId') postId: number,
    @Query() query: GetCommentsQueryParams,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    await this.queryBus.execute(new GetPostByIdQuery(postId, user)); //проверка что пост существует
    return this.queryBus.execute(new GetAllCommentsQuery(query, postId, user)); //(query, postId, user)
  }

  @Post(':postId/comments')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async createCommentForPost(
    @Param('postId') postId: number,
    @Body() body: CreateCommentInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<CommentViewDto> {
    return this.commandBus.execute(new CreateCommentCommand(postId, body, user));
  }
}
