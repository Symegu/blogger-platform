import { Types } from 'mongoose';

export class CreateCommentDomainDto {
  content: string;
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  userLogin: string;
}
