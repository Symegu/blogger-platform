import { LikesInfoViewDto } from 'src/modules/likes/api/view-dto/like.view-dto';
import { LikeStatus } from 'src/modules/likes/domain/like.entity';

import { CommentatorInfo, CommentDocument } from '../../domain/comments.entity';

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: LikesInfoViewDto;

  static mapToView(comment: CommentDocument): CommentViewDto {
    const dto = new CommentViewDto();

    dto.id = comment._id.toString();
    dto.content = comment.content;
    dto.commentatorInfo = comment.commentatorInfo;
    dto.createdAt = comment.createdAt.toISOString();
    dto.likesInfo = new LikesInfoViewDto(
      comment.likesInfo.likesCount,
      comment.likesInfo.dislikesCount,
      LikeStatus.None, // ← временно, пока не реализована логика определения myStatus
    );
    return dto;
  }
}
