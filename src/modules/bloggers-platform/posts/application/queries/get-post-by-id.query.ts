import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ExtendedLikesInfoViewDto } from 'src/modules/likes/api/view-dto/like.view-dto';
import { UserContextDto } from 'src/modules/user-accounts/dto/create-user.dto';

import { LikesService } from '../../../../likes/application/likes.service';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { PostsSqlRepository } from '../../infrastructure/posts-sql.repository';

export class GetPostByIdQuery {
  constructor(
    public id: number,
    public user: UserContextDto | null,
  ) {}
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler implements IQueryHandler<GetPostByIdQuery> {
  constructor(
    private readonly postsSqlRepository: PostsSqlRepository,
    private likesService: LikesService,
  ) {}
  async execute({ id, user }: GetPostByIdQuery): Promise<PostViewDto> {
    const post = await this.postsSqlRepository.findOrNotFoundFail(id);
    const extendedLikesInfo = (await this.likesService.buildLikesInfo(
      post.id,
      'Post',
      user?.id,
    )) as ExtendedLikesInfoViewDto;

    return PostViewDto.mapFromSql({
      ...post,
      extendedLikesInfo: {
        likesCount: extendedLikesInfo.likesCount,
        dislikesCount: extendedLikesInfo.dislikesCount,
        myStatus: extendedLikesInfo.myStatus,
        newestLikes: extendedLikesInfo.newestLikes,
      },
    });
  }
}
