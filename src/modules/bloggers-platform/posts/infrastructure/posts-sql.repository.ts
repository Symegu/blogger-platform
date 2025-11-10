import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';
import { DataSource } from 'typeorm';

import { PostData } from '../domain/posts.entity';
import { CreatePostData, UpdatePostData } from '../dto/create-post.dto';

@Injectable()
export class PostsSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findById(id: number): Promise<PostData | null> {
    const posts = await this.dataSource.query(
      `SELECT p.id, p.blog_id, p.blog_name, p.title, p.short_description, p.content, p.created_at, p.likes_count, p.dislikes_count
      FROM public."Posts" p
      WHERE p.id = $1 AND p.deleted_at IS NULL`,
      [id],
    );
    return posts[0];
  }

  async findOrNotFoundFail(id: number): Promise<PostData> {
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
    return posts[0];
  }

  async create(post: CreatePostData): Promise<number> {
    console.log('post create1', post);

    const result = await this.dataSource.query(
      `INSERT INTO public."Posts"
        (blog_id, blog_name, title, short_description, content)
        VALUES ($1,$2,$3,$4,$5) RETURNING id
      `,
      [post.blog_id, post.blog_name, post.title, post.short_description, post.content],
    );

    console.log('post create2', result[0].id);
    return result[0].id;
  }

  async update(id: number, post: UpdatePostData): Promise<number> {
    const posts = await this.dataSource.query(
      `SELECT p.id
       FROM public."Posts" p
       WHERE p.id = $1 AND p.deleted_at IS NULL
      `,
      [id],
    );

    const result = await this.dataSource.query(
      `UPDATE public."Posts"
        SET title = $2, short_description = $3, content = $4
        WHERE id = $1 AND deleted_at IS NULL`,
      [posts[0].id, post.title, post.shortDescription, post.content],
    );

    return result[0].id;
  }

  async delete(id: number): Promise<void> {
    const result = await this.dataSource.query(
      `UPDATE public."Posts"
       SET deleted_at = $1
       WHERE id = $2 AND deleted_at IS NULL`,
      [new Date(), id],
    );

    const rowCount = result[1];
    if (rowCount === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Posts not found or already deleted',
      });
    }
    return;
  }

  async updateLikeCounters(
    postId: number,
    likesCount: number,
    dislikesCount: number,
  ): Promise<void> {
    return await this.dataSource.query(
      `UPDATE public."Posts"
      SET
        likes_count = GREATEST(0, likes_count + $1),
        dislikes_count = GREATEST(0, dislikes_count + $2),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3`,
      [likesCount, dislikesCount, postId],
    );
  }
}
