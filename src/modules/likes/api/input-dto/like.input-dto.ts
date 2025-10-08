import { IsEnum } from 'class-validator';

export enum LikeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export class LikeInputModel {
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus; // 'None' | 'Like' | 'Dislike'
}
