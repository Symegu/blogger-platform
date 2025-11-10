import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';
import { DataSource } from 'typeorm';

import { CommentData } from '../domain/comments.entity';
import { CreateCommentData, UpdateCommentData } from '../dto/create-comment.dto';

@Injectable()
export class CommentsSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async findById(id: number): Promise<CommentData | null> {
    const result = await this.dataSource.query(
      `SELECT c.id, c.post_id, c.user_id, c.user_login, c.content, c.created_at, c.updated_at, c.deleted_at, c.likes_count, c.dislikes_count
        FROM public."Comments" c
        WHERE c.id = $1
      `,
      [id],
    );

    if (result.length === 0) return null;
    return result[0];
  }

  async create(comment: CreateCommentData): Promise<number> {
    const result = await this.dataSource.query(
      `INSERT INTO public."Comments"
        (post_id, user_id, user_login, content)
        VALUES ($1,$2,$3,$4) RETURNING id
      `,
      [comment.post_id, comment.user_id, comment.user_login, comment.content],
    );
    return result[0].id;
  }

  async update(comment: UpdateCommentData): Promise<number> {
    console.log(comment);

    const result = await this.dataSource.query(
      `UPDATE public."Comments"
        SET content = $3
        WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [comment.id, comment.user_id, comment.content],
    );
    return result[0].id;
  }

  async delete(id: number): Promise<void> {
    const result = await this.dataSource.query(
      `UPDATE public."Comments"
       SET deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );

    const rowCount = result[1];
    if (rowCount === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found or already deleted',
      });
    }
    return;
  }

  async findOrNotFoundFail(id: number): Promise<CommentData> {
    const result = await this.dataSource.query(
      `SELECT c.id, c.post_id, c.user_id, c.user_login, c.content, c.created_at, c.updated_at, c.deleted_at, c.likes_count, c.dislikes_count
        FROM public."Comments" c
        WHERE c.id = $1 AND deleted_at IS NULL
      `,
      [id],
    );

    if (result.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }

    return result[0];
  }
}
