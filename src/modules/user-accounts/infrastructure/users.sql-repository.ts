import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { DomainException, DomainExceptionCode } from '../../../core/exceptions/domain-exception';
import { UserData } from '../domain/user.entity';
import { CreateUserData } from '../dto/create-user.dto';

@Injectable()
export class UsersSqlRepository {
  //инжектирование модели через DI
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findById(id: number): Promise<UserData | null> {
    const user = await this.dataSource.query(
      `SELECT u.id, u.login, u.password_hash, u.email, u.is_email_confirmed, u.created_at, u.updated_at, u.deleted_at
       FROM public."Users" u
       WHERE u.id = $1 AND u.deleted_at IS NULL`,
      [id],
    );
    return user[0];
  }

  async findOrNotFoundFail(id: number): Promise<UserData[]> {
    const result = await this.dataSource.query(
      `SELECT u.id, u.login, u.password_hash, u.email, u.is_email_confirmed, u.created_at, u.updated_at, u.deleted_at
       FROM public."Users" u
       WHERE u.id = $1 AND u.deleted_at IS NULL`,
      [id],
    );
    if (result.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }
    return result[0];
  }

  async findByLoginOrEmail(loginOrEmail: string) {
    const users = await this.dataSource.query(
      `SELECT u.id, u.login, u.password_hash, u.email, u.is_email_confirmed, u.created_at, u.updated_at, u.deleted_at
       FROM public."Users" u
       WHERE (u.login = $1 OR u.email = $1) AND u.deleted_at IS NULL`,
      [loginOrEmail],
    );

    return users;
  }

  async adminCreate(user: CreateUserData): Promise<number> {
    const result = await this.dataSource.query(
      `INSERT INTO public."Users"
        (login, email, password_hash, is_email_confirmed, created_at)
        VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [user.login, user.email, user.passwordHash, true, new Date()],
    );

    const newUserId = result[0].id;
    await this.dataSource.query(
      `INSERT INTO public."UserNames" (user_id, first_name, last_name)
       VALUES ($1, $2, $3)`,
      [newUserId, 'firstName1', 'lastName2'],
    );

    return newUserId;
  }

  async create(
    user: CreateUserData,
    confirmationCode: string,
    confirmationCodeExpiration: Date,
  ): Promise<number> {
    const result = await this.dataSource.query(
      `INSERT INTO public."Users"
        (login, email, password_hash, is_email_confirmed, created_at)
        VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [user.login, user.email, user.passwordHash, false, new Date()],
    );

    const newUserId = result[0].id;
    await this.dataSource.query(
      `INSERT INTO public."EmailConfirmationCodes" 
       (user_id, confirmation_code, expiration_date)
       VALUES ($1, $2, $3)`,
      [newUserId, confirmationCode, confirmationCodeExpiration],
    );

    return newUserId;
  }

  async delete(id: number): Promise<void> {
    const result = await this.dataSource.query(
      `UPDATE public."Users"
     SET deleted_at = $1
     WHERE id = $2 AND deleted_at IS NULL`,
      [new Date(), id],
    );

    const rowCount = result[1];
    if (rowCount === 0) {
      console.log(`User with id ${id} not found or already deleted`);
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found or already deleted',
      });
    }
    return;
  }
}
