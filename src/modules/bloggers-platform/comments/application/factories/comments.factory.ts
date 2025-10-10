import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { CreateCommentInputDto } from '../../api/input-dto/comment.input-dto';
import { Comment, CommentModelType, CommentDocument } from '../../domain/comments.entity';
import { CreateCommentDomainDto } from '../../dto/create-comment.dto';

@Injectable()
export class CommentsFactory {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
  ) {}

  create(
    dto: CreateCommentInputDto,
    userId: Types.ObjectId,
    userLogin: string,
    postId: Types.ObjectId,
  ): CommentDocument {
    const domainDto: CreateCommentDomainDto = {
      content: dto.content,
      userId,
      userLogin,
      postId,
    };
    return this.CommentModel.createInstance(domainDto);
  }
}
