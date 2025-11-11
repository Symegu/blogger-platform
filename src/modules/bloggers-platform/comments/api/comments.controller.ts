import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ExtractUserFromRequest } from 'src/core/decorators/param/extract-user-from-request';
import { LikeInputModel } from 'src/modules/likes/api/input-dto/like.input-dto';
import { SetLikeStatusCommand } from 'src/modules/likes/application/set-like-status.usecase';
import { UserContextDto } from 'src/modules/user-accounts/dto/create-user.dto';
import { JwtAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-auth.guard';
import { JwtOptionalAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-optional-auth.guard';

import { UpdateCommentInputDto } from './input-dto/comment.input-dto';
import { GetCommentByIdQuery } from '../application/queries/get-comment-by-id.query';
import { DeleteCommentCommand } from '../application/usecases/delete-comment.usecase';
import { UpdateCommentCommand } from '../application/usecases/update-comment.usecase';

@Controller('comments')
export class CommentsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {
    console.log('Comments controller created');
  }

  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  async getById(@Param('id') id: number, @ExtractUserFromRequest() user: UserContextDto) {
    return this.queryBus.execute(new GetCommentByIdQuery(id, user));
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Param('id') id: number,
    @Body() dto: UpdateCommentInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ) {
    return this.commandBus.execute(new UpdateCommentCommand(id, dto, user));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async deleteComment(@Param('id') id: number, @ExtractUserFromRequest() user: UserContextDto) {
    return this.commandBus.execute(new DeleteCommentCommand(id, user));
  }

  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async updateLikeStatusForComment(
    @Param('commentId')
    commentId: number,
    @Body() body: LikeInputModel,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    await this.queryBus.execute(new GetCommentByIdQuery(commentId, user));
    return await this.commandBus.execute(
      new SetLikeStatusCommand(commentId, 'Comment', body.likeStatus, user),
    );
  }
}
