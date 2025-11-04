import { Injectable } from '@nestjs/common';

import { CreateUserData, CreateUserDto } from '../../dto/create-user.dto';
import { CryptoService } from '../crypto.service';

@Injectable()
export class UsersFactory {
  // ❌ passwordHash: string; ни в коем случае не шарим состояние между методов через св-ва объекта (сервиса, юзкейса, квери, репозитория)
  // потому что синглтон, между разными запросами может быть перезапись данных

  constructor(private readonly cryptoService: CryptoService) {}

  async create(dto: CreateUserDto): Promise<CreateUserData> {
    const passwordHash = await this.createPasswordHash(dto);
    const user = await this.createUserData(dto, passwordHash);

    return user;
  }

  private async createPasswordHash(dto: CreateUserDto) {
    const passwordHash = await this.cryptoService.createHash(dto.password);
    return passwordHash;
  }

  private async createUserData(dto: CreateUserDto, passwordHash: string) {
    return {
      login: dto.login,
      passwordHash: passwordHash,
      email: dto.email,
    };

    // const userNameData: CreateUserNameData = {
    //   firstName: 'firstName xxx',
    //   lastName: 'lastName yyy',
    // };
  }
}
