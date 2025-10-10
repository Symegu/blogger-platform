import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';

import { GetCommentsQueryParams } from '../../api/input-dto/comment.input-dto';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import { Comment, CommentModelType } from '../../domain/comments.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
  ) {}

  async getByIdOrNotFoundFail(id: Types.ObjectId): Promise<CommentViewDto> {
    const comment = await this.CommentModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }

    return CommentViewDto.mapToView(comment);
  }

  async getAll(
    query: GetCommentsQueryParams,
    postId: Types.ObjectId,
    //user?: { userId: Types.ObjectId; userLogin: string },
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    // фильтр

    console.log('GetAllCommentsQueryHandler execute', query, postId);
    const filter: any = { postId, deletedAt: null };
    // if (query.searchTitleTerm) {
    //   filter.title = { $regex: query.searchTitleTerm, $options: 'i' };
    // }

    // if (user?.userId) {
    //   filter.blogId = { $regex: user.userId };
    // }

    const totalCount = await this.CommentModel.countDocuments(filter);

    console.log('filter', filter);
    const result = await this.CommentModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection === 'asc' ? 1 : -1 })
      .skip((query.pageNumber - 1) * query.pageSize)
      .limit(query.pageSize);
    console.log('result', result);

    return {
      totalCount,
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      items: result.map(p => CommentViewDto.mapToView(p)),
    };
  }
}
