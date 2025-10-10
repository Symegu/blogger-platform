export class LikesInfoViewDto {
  likesCount: number;
  dislikesCount: number;
  myStatus: 'None' | 'Like' | 'Dislike';
}

export class LikeDetailsViewDto {
  addedAt: Date;
  userId: string;
  login: string;
}

export class ExtendedLikesInfoViewDto {
  likesCount: number;
  dislikesCount: number;
  myStatus: 'None' | 'Like' | 'Dislike';
  newestLikes: LikeDetailsViewDto[];
}
