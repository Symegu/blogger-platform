import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';
import { DataSource } from 'typeorm';

import { GetBlogsQueryParams } from '../../api/input-dto/blogs.input-dto';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';

@Injectable()
export class BlogsSqlQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getByIdOrNotFoundFail(id: number): Promise<BlogViewDto> {
    const result = await this.dataSource.query(
      `SELECT b.id, b.name, b.description, b.website_url, b.is_membership, b.created_at
        FROM public."Blogs" b
        WHERE b.id = $1 AND b.deleted_at IS NULL`,
      [id],
    );

    if (result.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }

    return BlogViewDto.mapFromSql(result[0]);
  }

  async getAll(query: GetBlogsQueryParams): Promise<PaginatedViewDto<BlogViewDto[]>> {
    console.log(query);

    const whereConditions: string[] = ['b.deleted_at IS NULL'];
    const params: any[] = [];
    //const orConditions: string[] = [];
    let paramCount = 0;

    if (query.searchNameTerm) {
      paramCount++;
      whereConditions.push(`b.name ILIKE $${paramCount}`);
      params.push(`%${query.searchNameTerm}%`);
    }
    const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const countQuery = `
      SELECT COUNT(*) AS total_count
      FROM "Blogs" b
      ${whereClause}
    `;

    const countResult = await this.dataSource.query(countQuery, params);
    const totalCount = parseInt(countResult[0].total_count, 10);
    // Сортировка
    const sortField = this.getSortField(query.sortBy.toString());
    const sortDirection = query.sortDirection === 'asc' ? 'ASC' : 'DESC';
    const orderByClause = `ORDER BY ${sortField} ${sortDirection}`;

    // Пагинация
    paramCount++;
    const limitClause = `LIMIT $${paramCount}`;
    params.push(query.pageSize);

    paramCount++;
    const offsetClause = `OFFSET $${paramCount}`;
    params.push((query.pageNumber - 1) * query.pageSize);
    const mainQuery = `
    SELECT  b.id, b.name, b.description, b.website_url, b.is_membership, b.created_at
    FROM "Blogs" b
    ${whereClause}
    ${orderByClause}
    ${limitClause}
    ${offsetClause}
  `;

    const blogs = await this.dataSource.query(mainQuery, params);
    return {
      totalCount: totalCount,
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      items: blogs.map(blog => BlogViewDto.mapFromSql(blog)),
    };
  }
  private getSortField(sortBy: string): string {
    const sortMap: Record<string, string> = {
      name: 'b.name COLLATE "C"',
      createdAt: 'b.created_at',
      id: 'b.id',
    };
    return sortMap[sortBy] || 'b.created_at';
  }
}
