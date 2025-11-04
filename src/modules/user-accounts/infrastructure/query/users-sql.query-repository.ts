import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import {
  DomainException,
  DomainExceptionCode,
  Extension,
} from '../../../../core/exceptions/domain-exception';
import { GetUsersQueryParams } from '../../api/input-dto/users.input-dto';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { UserData } from '../../domain/user.entity';

@Injectable()
export class UsersSqlQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async findByLogin(login: string): Promise<UserData[]> {
    const users = await this.dataSource.query(
      `SELECT u.id, u.login, u.password_hash, u.email, u.is_email_confirmed, u.created_at, u.updated_at, u.deleted_at
       FROM public."Users" u
       WHERE u.login = $1 AND u.deleted_at IS NULL`,
      [login],
    );
    if (users.length !== 0) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Login already exists',
        errorsMessages: [new Extension('Login already exists', 'login')],
      });
    }
    return users;
  }

  async findByEmail(email: string): Promise<UserData[]> {
    const users = await this.dataSource.query(
      `SELECT u.id, u.login, u.password_hash, u.email, u.is_email_confirmed, u.created_at, u.updated_at, u.deleted_at
       FROM public."Users" u
       WHERE u.email = $1 AND u.deleted_at IS NULL`,
      [email],
    );
    if (users.length !== 0) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email already exists',
        errorsMessages: [new Extension('Email already exists', 'email')],
      });
    }
    return users;
  }

  async getByIdOrNotFoundFail(id: number): Promise<UserViewDto> {
    const users = await this.dataSource.query(
      `SELECT u.id, u.login, u.password_hash, u.email, u.is_email_confirmed, u.created_at, u.updated_at, u.deleted_at
       FROM public."Users" u
       WHERE u."id" = $1 AND u."deleted_at" IS NULL`,
      [id],
    );

    if (users.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }
    return UserViewDto.mapFromSql(users[0]);
  }

  async getAll(query: GetUsersQueryParams): Promise<PaginatedViewDto<UserViewDto[]>> {
    console.log(query);

    const whereConditions: string[] = ['u.deleted_at IS NULL'];
    const params: any[] = [];
    let paramCount = 0;

    const orConditions: string[] = [];

    if (query.searchLoginTerm) {
      paramCount++;
      orConditions.push(`u.login ILIKE $${paramCount}`);
      params.push(`%${query.searchLoginTerm}%`);
    }

    if (query.searchEmailTerm) {
      paramCount++;
      orConditions.push(`u.email ILIKE $${paramCount}`);
      params.push(`%${query.searchEmailTerm}%`);
    }

    if (orConditions.length > 0) {
      whereConditions.push(`(${orConditions.join(' OR ')})`);
    }

    const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Подсчёт общего количества
    const countQuery = `
      SELECT COUNT(*) AS total_count
      FROM "Users" u
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

    // Основной запрос
    const mainQuery = `
    SELECT 
      u.id, u.login, u.password_hash, u.email, u.is_email_confirmed, u.created_at, u.updated_at, u.deleted_at
    FROM "Users" u
    ${whereClause}
    ${orderByClause}
    ${limitClause}
    ${offsetClause}
  `;

    const users = await this.dataSource.query(mainQuery, params);

    return {
      totalCount,
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      items: users.map(user => UserViewDto.mapFromSql(user)),
    };
  }

  private getSortField(sortBy: string): string {
    const sortMap: Record<string, string> = {
      login: 'u.login COLLATE "C"',
      email: 'u.email COLLATE "C"',
      createdAt: 'u.created_at',
      id: 'u.id',
    };
    return sortMap[sortBy] || 'u.created_at';
  }
}
