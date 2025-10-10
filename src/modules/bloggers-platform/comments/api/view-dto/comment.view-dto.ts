import { LikesInfoViewDto } from 'src/modules/likes/api/view-dto/like.view-dto';
import { LikeStatus } from 'src/modules/likes/domain/like.entity';

import { CommentDocument } from '../../domain/comments.entity';
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

  static mapToView(comment: CommentDocument): CommentViewDto {
    const dto = new CommentViewDto();

    dto.id = comment._id.toString();
    dto.content = comment.content;
    dto.commentatorInfo = {
      userId: comment.commentatorInfo.userId.toString(),
      userLogin: comment.commentatorInfo.userLogin,
    };
    dto.createdAt = comment.createdAt;

    // Если likesInfo передан — используем; иначе дефолт
    dto.likesInfo = {
      likesCount: comment.likesInfo?.likesCount ?? 0,
      dislikesCount: comment.likesInfo?.dislikesCount ?? 0,
      myStatus: comment.likesInfo?.myStatus ?? 'None',
    };

    return dto;
  }
}
