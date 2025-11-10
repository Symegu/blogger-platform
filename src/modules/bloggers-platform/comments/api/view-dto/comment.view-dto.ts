import { LikesInfoViewDto } from 'src/modules/likes/api/view-dto/like.view-dto';

import { CommentDataWithLikes } from '../../domain/comments.entity';

export class CommentatorInfoDto {
  userId: string;
  userLogin: string;
}
export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfoDto;
  createdAt: Date;
  likesInfo: LikesInfoViewDto;

  static mapFromSql(comment: CommentDataWithLikes): CommentViewDto {
    const dto = new CommentViewDto();

    dto.id = comment.id.toString();
    dto.content = comment.content;
    dto.commentatorInfo = {
      userId: comment.user_id.toString(),
      userLogin: comment.user_login,
    };
    dto.createdAt = comment.created_at;
    dto.likesInfo = {
      likesCount: comment.likesInfo?.likesCount ?? 0,
      dislikesCount: comment.likesInfo?.dislikesCount ?? 0,
      myStatus: comment.likesInfo?.myStatus ?? 'None',
    };

    return dto;
  }
}
