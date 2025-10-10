import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';

import { Post, PostDocument, PostModelType } from '../domain/posts.entity';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from '../api/input-dto/posts.input-dto';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async findById(id: Types.ObjectId): Promise<PostDocument | null> {
    return this.PostModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async save(post: PostDocument) {
    await post.save();
  }

  async findOrNotFoundFail(id: Types.ObjectId): Promise<PostDocument> {
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

    return post;
  }

  async updateLikeCountersAndNewest(
    postId: Types.ObjectId,
    likesCount: number,
    dislikesCount: number,
    newestLikes: { addedAt: Date; userId: string; login: string }[],
  ): Promise<void> {
    await this.PostModel.updateOne(
      { _id: postId },
      {
        $set: {
          'extendedLikesInfo.likesCount': likesCount,
          'extendedLikesInfo.dislikesCount': dislikesCount,
          'extendedLikesInfo.newestLikes': newestLikes,
        },
      },
    ).exec();
  }

  async getAll(
    query: GetPostsQueryParams,
    blogId?: Types.ObjectId,
  ): Promise<PaginatedViewDto<any[]>> {
    // возвращаем plain objects
    const filter: any = { deletedAt: null };
    if (blogId) {
      // корректно фильтруем по полю blogId
      filter.blogId = blogId;
    }

    if (query.blogId) {
      // корректно фильтруем по полю blogId
      filter.blogId = query.blogId;
    }

    const totalCount = await this.PostModel.countDocuments(filter);

    const result = await this.PostModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection === 'asc' ? 1 : -1 })
      .skip((query.pageNumber - 1) * query.pageSize)
      .limit(query.pageSize)
      .lean() // <- важно: вернём plain js objects
      .exec();

    return {
      totalCount,
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      items: result, // plain objects, у каждого есть _id
    };
  }
}
