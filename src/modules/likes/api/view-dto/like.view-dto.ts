import { LikeDetailsViewModel } from './like-details.view-dto';
import { LikeStatus } from '../input-dto/like.input-dto';

export class LikesInfoViewDto {
  constructor(
    public likesCount: number,
    public dislikesCount: number,
    public myStatus: LikeStatus,
  ) {}
}

export class ExtendedLikesInfoViewModel extends LikesInfoViewDto {
  constructor(
    likesCount: number,
    dislikesCount: number,
    myStatus: LikeStatus,
    public newestLikes: LikeDetailsViewModel[],
  ) {
    super(likesCount, dislikesCount, myStatus);
  }
}
