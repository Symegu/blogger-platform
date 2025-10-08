import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';

import { GetBlogsQueryParams } from '../../api/input-dto/blogs.input-dto';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { Blog, BlogModelType } from '../../domain/blogs.entity';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

  async getByIdOrNotFoundFail(id: Types.ObjectId): Promise<BlogViewDto> {
    const blog = await this.BlogModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }

    return BlogViewDto.mapToView(blog);
  }
  async getAll(query: GetBlogsQueryParams): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const filter: any = { deletedAt: null };
    if (query.searchNameTerm) {
      filter.name = { $regex: query.searchNameTerm, $options: 'i' };
    }
    const totalCount = await this.BlogModel.countDocuments(filter);
    const sortField = query.sortBy || 'createdAt';
    const sortDirection = query.sortDirection === 'asc' ? 1 : -1;
    const result = await this.BlogModel.find(filter)
      .sort({ [sortField]: sortDirection })
      .skip((query.pageNumber - 1) * query.pageSize)
      .limit(query.pageSize)
      .exec();

    return {
      totalCount: totalCount,
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      items: result.map(blog => BlogViewDto.mapToView(blog)),
    };
  }
}
