import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';
import { DataSource } from 'typeorm';

import { GetPostsQueryParams } from '../../api/input-dto/posts.input-dto';
import { PostData } from '../../domain/posts.entity';

@Injectable()
export class PostsSqlQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getByIdOrNotFoundFail(id: number): Promise<PostData> {
    const posts = await this.dataSource.query(
      `SELECT p.id, p.blog_id, p.blog_name, p.title, p.short_description, p.content, p.created_at, p.likes_count, p.dislikes_count
            FROM public."Posts" p
            WHERE p.id = $1 AND p.deleted_at IS NULL`,
      [id],
    );
    if (posts.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }
    // const likes = await this.dataSource.query(``); //????
    return posts[0];
  }

  async getAll(query: GetPostsQueryParams, blogId?: number): Promise<PaginatedViewDto<PostData[]>> {
    const whereConditions: string[] = ['p.deleted_at IS NULL'];
    const params: any[] = [];
    //const orConditions: string[] = [];
    let paramCount = 0;

    const actualBlogId = blogId || query.blogId;
    if (actualBlogId) {
      paramCount++;
      whereConditions.push(`p.blog_id = $${paramCount}`); // = для точного сравнения
      params.push(actualBlogId); // Без % для чисел
    }

    const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const countQuery = `
      SELECT COUNT(*) AS total_count
      FROM "Posts" p
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
      SELECT p.id, p.blog_id, p.blog_name, p.title, p.short_description, p.content, p.created_at, p.likes_count, p.dislikes_count
      FROM "Posts" p
      ${whereClause}
      ${orderByClause}
      ${limitClause}
      ${offsetClause}
    `;
    console.log('Posts SQL Query:', mainQuery);
    console.log('Posts SQL Params:', params);

    const rawPosts = await this.dataSource.query(mainQuery, params);
    console.log('Raw posts result:', rawPosts);
    return {
      totalCount: totalCount,
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      items: rawPosts,
    };
  }
  private getSortField(sortBy: string): string {
    const sortMap: Record<string, string> = {
      id: 'p.id',
      title: 'p.title',
      shortDescription: 'p.short_description',
      content: 'p.content',
      blogId: 'p.blog_id',
      blogName: 'p.blog_name COLLATE "C"',
      createdAt: 'p.created_at',
    };
    return sortMap[sortBy] || 'p.created_at';
  }
}
