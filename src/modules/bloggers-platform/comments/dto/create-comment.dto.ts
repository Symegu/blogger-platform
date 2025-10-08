import { Types } from 'mongoose';

import { CommentatorInfo } from '../domain/comments.entity';

export class CreateCommentDomainDto {
  content: string;
  postId: Types.ObjectId;
  commentatorInfo: CommentatorInfo;
}
