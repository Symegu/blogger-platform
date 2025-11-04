import { Injectable } from '@nestjs/common';

import { CryptoService } from './crypto.service';
import { UserContextDto } from '../dto/create-user.dto';
import { UsersSqlQueryRepository } from '../infrastructure/query/users-sql.query-repository';
import { UsersSqlRepository } from '../infrastructure/users.sql-repository';

@Injectable()
export class AuthService {
  constructor(
    private usersSqlRepository: UsersSqlRepository,
    private usersSqlQueryRepository: UsersSqlQueryRepository,
    private cryptoService: CryptoService,
  ) {}
  async validateUser(loginOrEmail: string, password: string): Promise<UserContextDto | null> {
    const users = await this.usersSqlRepository.findByLoginOrEmail(loginOrEmail);
    console.log(users);

    if (users.length === 0) {
      return null;
    }

    const validPassword = await this.cryptoService.comparePassword(
      password,
      users[0].password_hash,
    );

    if (!validPassword) {
      return null;
    }

    return { id: users[0].id, login: users[0].login, email: users[0].email };
  }

  async ensureUserUniqueness(email: string, login: string) {
    await this.usersSqlQueryRepository.findByEmail(email);
    await this.usersSqlQueryRepository.findByLogin(login);
  }
}
