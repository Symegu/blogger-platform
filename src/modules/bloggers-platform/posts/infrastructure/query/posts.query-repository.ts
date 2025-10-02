import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../domain/posts.entity';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/posts.input-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<PostViewDto> {
    const post = await this.PostModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!post) {
      throw new NotFoundException('post not found');
    }

    return PostViewDto.mapToView(post);
  }

  async getAll(
    query: GetPostsQueryParams,
    blogId?: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    // фильтр
    const filter: any = {};
    // if (query.searchTitleTerm) {
    //   filter.title = { $regex: query.searchTitleTerm, $options: 'i' };
    // }

    if (blogId) {
      filter.blogId = { $regex: blogId };
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
      items: result.map((p) => PostViewDto.mapToView(p)),
    };
  }
}
