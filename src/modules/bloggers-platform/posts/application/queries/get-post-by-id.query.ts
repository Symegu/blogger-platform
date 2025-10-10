import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
// import { PostsQueryRepository } from '../../infrastructure/query/posts.query-repository';
import { LikeableEntity } from 'src/modules/likes/domain/like.entity';
import { UserContextDto } from 'src/modules/user-accounts/dto/create-user.dto';

import { LikesService } from '../../../../likes/application/likes.service';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class GetPostByIdQuery {
  constructor(
    public id: Types.ObjectId,
    public user: UserContextDto | null,
  ) {}
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler implements IQueryHandler<GetPostByIdQuery> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private likesService: LikesService,
  ) {}
  async execute({ id, user }: GetPostByIdQuery) {
    //return this.postsQueryRepository.getByIdOrNotFoundFail(query.id);
    const post = await this.postsRepository.findOrNotFoundFail(id);
    const extendedLikesInfo = await this.likesService.buildLikesInfo(
      post._id,
      LikeableEntity.Post,
      user?.id,
    );
    post.extendedLikesInfo = extendedLikesInfo;

    return PostViewDto.mapToView(post);
  }
}
