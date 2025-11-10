import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';
import { DataSource } from 'typeorm';

import { BlogData } from '../domain/blogs.entity';
import { CreateBlogData } from '../dto/create-blog.dto';

@Injectable()
export class BlogsSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findById(id: number): Promise<BlogData | null> {
    const blog = await this.dataSource.query(
      `SELECT b.id, b.name, b.description, b.website_url, b.is_membership
        FROM public."Blogs" b
        WHERE b.id = $1 AND b.deleted_at IS NULL`,
      [id],
    );
    return blog[0];
  }

  async findOrNotFoundFail(id: number): Promise<BlogData> {
    const result = await this.dataSource.query(
      `SELECT b.id, b.name, b.description, b.website_url, b.is_membership
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

    return result[0];
  }

  async create(blog: CreateBlogData): Promise<number> {
    const result = await this.dataSource.query(
      `INSERT INTO public."Blogs"
          (name, description, website_url, is_membership)
          VALUES ($1, $2, $3, $4) RETURNING id`,
      [blog.name, blog.description, blog.website_url, blog.is_membership],
    );

    return result[0].id;
  }

  async update(id: number, blog: CreateBlogData): Promise<number> {
    const blogs = await this.dataSource.query(
      `SELECT b.id, b.name, b.description, b.website_url, b.is_membership
       FROM public."Blogs" b
       WHERE b.id = $1 AND b.deleted_at IS NULL
      `,
      [id],
    );
    const result = await this.dataSource.query(
      `UPDATE public."Blogs"
        SET name = $2, description = $3, website_url = $4, is_membership = $5
        WHERE id = $1`,
      [blogs[0].id, blog.name, blog.description, blog.website_url, blog.is_membership],
    );

    return result[0].id;
  }

  async delete(id: number): Promise<void> {
    const result = await this.dataSource.query(
      `UPDATE public."Blogs"
       SET deleted_at = $1
       WHERE id = $2 AND deleted_at IS NULL`,
      [new Date(), id],
    );

    const rowCount = result[1];
    if (rowCount === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found or already deleted',
      });
    }
    return;
  }
}
