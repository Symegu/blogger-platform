import { Injectable } from '@nestjs/common';
import { MeViewDto } from '../../api/view-dto/me.view-dto';
import { User, UserModelType } from '../../domain/user.entity';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../../core/exceptions/domain-exception';
import { InjectModel } from '@nestjs/mongoose';
import { ConfirmationInfoDto } from '../../../../modules/notifications/dto/confirmation-info.dto';

@Injectable()
export class AuthQueryRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}

  async getMe(id: string): Promise<MeViewDto> {
    const user = await this.UserModel.findOne({ _id: id, deletedAt: null });
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }
    return MeViewDto.mapToView(user);
  }

  async getConfirmationInfo(id: string): Promise<ConfirmationInfoDto> {
    const user = await this.UserModel.findOne({ _id: id, deletedAt: null });
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }
    return user;
  }

  async getUserByConfirmationCode(code: string): Promise<ConfirmationInfoDto> {
    const user = await this.UserModel.findOne({
      confirmationCode: code,
      deletedAt: null,
    });
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User not found',
        errorsMessages: [{ message: 'User not found', field: 'code' }],
      });
    }
    return user;
  }

  async getUserByRecoveryCode(code: string): Promise<ConfirmationInfoDto> {
    const user = await this.UserModel.findOne({
      recoveryCode: code,
      deletedAt: null,
    });
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User not found',
        errorsMessages: [{ message: 'User not found', field: 'code' }],
      });
    }
    return user;
  }
}
