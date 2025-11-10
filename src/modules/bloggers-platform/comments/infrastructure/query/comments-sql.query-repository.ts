import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { DataSource } from 'typeorm';

import { GetCommentsQueryParams } from '../../api/input-dto/comment.input-dto';
import { CommentData } from '../../domain/comments.entity';

@Injectable()
export class CommentsSqlQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  // async getByIdOrNotFoundFail(id: number): Promise<CommentViewDto> {
  //   const comment = await this.CommentModel.findOne({
  //     _id: id,
  //     deletedAt: null,
  //   });

  //   if (!comment) {
  //     throw new DomainException({
  //       code: DomainExceptionCode.NotFound,
  //       message: 'Comment not found',
  //     });
  //   }

  //   return CommentViewDto.mapToView(comment);
  // }

  async getAll(
    query: GetCommentsQueryParams,
    postId: number,
  ): Promise<PaginatedViewDto<CommentData[]>> {
    console.log('query postid', query, postId);

    const whereConditions: string[] = ['c.deleted_at IS NULL'];
    const params: any[] = [];
    let paramCount = 0;

    if (postId) {
      paramCount++;
      whereConditions.push(`c.post_id = $${paramCount}`); // = для точного cравнения
      params.push(+postId); // Без % для чиcел
    }

    const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const countQuery = `
      SELECT COUNT(*) AS total_count
      FROM public."Comments" c
      ${whereClause}
    `;
    const countResult = await this.dataSource.query(countQuery, params);
    const totalCount = parseInt(countResult[0].total_count, 10);
    const sortField = this.getSortField(query.sortBy?.toString() || 'createdAt');
    const sortDirection = query.sortDirection === 'asc' ? 'ASC' : 'DESC';
    const orderByClause = `ORDER BY ${sortField} ${sortDirection}`;
    paramCount++;
    const limitClause = `LIMIT $${paramCount}`;
    params.push(query.pageSize);

    paramCount++;
    const offsetClause = `OFFSET $${paramCount}`;
    params.push((query.pageNumber - 1) * query.pageSize);
    const mainQuery = `
      SELECT c.id, c.post_id, c.user_id, c.user_login, c.content, c.created_at, c.likes_count, c.dislikes_count
      FROM public."Comments" c
      ${whereClause}
      ${orderByClause}
      ${limitClause}
      ${offsetClause}
    `;
    console.log('Comments SQL Query:', mainQuery);
    console.log('Comments SQL Params:', params);

    const rawComments = await this.dataSource.query(mainQuery, params);
    console.log('Raw Comments result:', rawComments);
    return {
      totalCount: totalCount,
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      items: rawComments,
    };
  }

  private getSortField(sortBy: string): string {
    const sortMap: Record<string, string> = {
      id: 'c.id',
      postId: 'c.post_id',
      content: 'c.content',
      createdAt: 'c.created_at',
    };
    return sortMap[sortBy] || 'c.created_at';
  }
}
