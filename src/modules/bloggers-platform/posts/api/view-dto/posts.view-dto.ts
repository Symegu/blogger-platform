import { ExtendedLikesInfoViewDto } from 'src/modules/likes/api/view-dto/like.view-dto';

import { PostDataWithLikes } from '../../domain/posts.entity';

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfoViewDto;

  static mapFromSql(post: PostDataWithLikes): PostViewDto {
    const dto = new PostViewDto();

    dto.id = post.id.toString();
    dto.title = post.title;
    dto.shortDescription = post.short_description;
    dto.content = post.content;
    dto.blogId = post.blog_id.toString();
    dto.blogName = post.blog_name;
    dto.createdAt = post.created_at;
    dto.extendedLikesInfo = {
      likesCount: post.extendedLikesInfo?.likesCount ?? 0,
      dislikesCount: post.extendedLikesInfo?.dislikesCount ?? 0,
      myStatus: post.extendedLikesInfo?.myStatus ?? 'None',
      newestLikes: post.extendedLikesInfo?.newestLikes ?? [],
    };
    return dto;
  }
}
