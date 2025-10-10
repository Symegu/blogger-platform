import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Types } from 'mongoose';
import { BaseQueryParams } from 'src/core/dto/base.query-params.input-dto';

export class CreateCommentInputDto {
  @IsString()
  @IsNotEmpty()
  @Length(20, 300)
  content: string;
}

export class UpdateCommentInputDto {
  @IsString()
  @IsNotEmpty()
  @Length(20, 300)
  content: string;
}

export enum CommentsSortBy {
  CreatedAt = 'createdAt',
}
export class GetCommentsQueryParams extends BaseQueryParams {
  sortBy: CommentsSortBy = CommentsSortBy.CreatedAt;
  postId: Types.ObjectId;
}
