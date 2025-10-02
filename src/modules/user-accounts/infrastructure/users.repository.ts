import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { User, UserDocument, UserModelType } from '../domain/user.entity';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../core/exceptions/domain-exception';

@Injectable()
export class UsersRepository {
  //инжектирование модели через DI
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async save(user: UserDocument) {
    await user.save();
  }

  async findOrNotFoundFail(id: string): Promise<UserDocument> {
    const user = await this.findById(id);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'NotFound',
      });
    }

    return user;
  }

  async findByLoginOrEmail(loginOrEmail: string) {
    return this.UserModel.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
      deletedAt: null,
    });
  }
}
