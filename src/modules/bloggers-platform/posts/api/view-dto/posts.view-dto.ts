import { Types } from 'mongoose';

import { PostDocument } from '../../domain/posts.entity';
import { ExtendedLikesInfoViewDto } from 'src/modules/likes/api/view-dto/like.view-dto';
import { LikeStatus } from 'src/modules/likes/domain/like.entity';

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: Types.ObjectId;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfoViewDto;

  static mapToView(post: PostDocument): PostViewDto {
    const dto = new PostViewDto();

    dto.id = post._id.toString() ?? post.id;
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt;
    dto.extendedLikesInfo = {
      likesCount: post.extendedLikesInfo?.likesCount ?? 0,
      dislikesCount: post.extendedLikesInfo?.dislikesCount ?? 0,
      myStatus: post.extendedLikesInfo?.myStatus ?? LikeStatus.None,
      newestLikes: post.extendedLikesInfo?.newestLikes ?? [],
    };
    return dto;
  }
}
