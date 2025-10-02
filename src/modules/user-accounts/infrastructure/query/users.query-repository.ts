import { InjectModel } from '@nestjs/mongoose';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { User, UserDocument, UserModelType } from '../../domain/user.entity';
import { GetUsersQueryParams } from '../../api/input-dto/users.input-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import {
  DomainException,
  DomainExceptionCode,
} from 'src/core/exceptions/domain-exception';

export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}
  async findByLogin(login: string): Promise<UserDocument | null> {
    return await this.UserModel.findOne({
      login: login,
      deletedAt: null,
    });
  }
  async findByEmail(email: string): Promise<UserDocument | null> {
    const user = await this.UserModel.findOne({
      email,
      deletedAt: null,
    });
    return user;
  }

  async getByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
    const user = await this.UserModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return UserViewDto.mapToView(user);
  }

  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const filter: any = { deletedAt: null }; // добавляем фильтр на не удалённых

    // Если есть поисковые термы — используем $or
    const orConditions: any[] = [];

    if (query.searchLoginTerm) {
      orConditions.push({
        login: { $regex: query.searchLoginTerm, $options: 'i' },
      });
    }

    if (query.searchEmailTerm) {
      orConditions.push({
        email: { $regex: query.searchEmailTerm, $options: 'i' },
      });
    }

    if (orConditions.length > 0) {
      filter.$or = orConditions;
    }
    const totalCount = await this.UserModel.countDocuments(filter);
    const result = await this.UserModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection === 'asc' ? 1 : -1 })
      .skip((query.pageNumber - 1) * query.pageSize)
      .limit(query.pageSize)
      .lean()
      .exec();

    return {
      totalCount: totalCount,
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      items: result.map((user) => UserViewDto.mapToView(user)),
    };
  }
}
