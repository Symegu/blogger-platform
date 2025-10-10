import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';

import { GetPostsQueryParams } from '../../api/input-dto/posts.input-dto';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { Post, PostModelType } from '../../domain/posts.entity';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
  ) {}

  async getByIdOrNotFoundFail(id: Types.ObjectId): Promise<PostViewDto> {
    const post = await this.PostModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }

    return PostViewDto.mapToView(post);
  }

  async getAll(
    query: GetPostsQueryParams,
    blogId?: Types.ObjectId,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    // фильтр
    const filter: any = {};
    if (blogId) {
      filter.blogId = { blogId, deletedAt: null };
    }

    const totalCount = await this.PostModel.countDocuments(filter);

    const result = await this.PostModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection === 'asc' ? 1 : -1 })
      .skip((query.pageNumber - 1) * query.pageSize)
      .limit(query.pageSize);

    return {
      totalCount,
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      items: result.map(p => PostViewDto.mapToView(p)),
    };
  }
}
