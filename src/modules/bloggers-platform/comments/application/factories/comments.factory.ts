import { Injectable } from '@nestjs/common';

import { CreateCommentInputDto } from '../../api/input-dto/comment.input-dto';
import { CreateCommentData } from '../../dto/create-comment.dto';

@Injectable()
export class CommentsFactory {
  constructor() {}

  create(
    dto: CreateCommentInputDto,
    userId: number,
    userLogin: string,
    postId: number,
  ): CreateCommentData {
    return {
      content: dto.content,
      user_id: userId,
      user_login: userLogin,
      post_id: postId,
    };
  }
}
